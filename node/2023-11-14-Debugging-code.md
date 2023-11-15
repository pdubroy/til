# Debugging code in JS libraries

This is a follow up to a question I asked on Twitter:

> What are some good patterns for permanently including debugging code in a JS lib?
>
> Eg: verbose logging, saving intermediate artifacts to disk, etc. But minimal / no perf impact in prod build.
>
> I've done this in different ways, but never settled on patterns I'm really happy with.

## The challenge

It's often useful to have debugging code that's permanently part of your codebase. This could be logging/tracing code, or something more complex (e.g., [Node's `--prof` option](https://nodejs.org/en/docs/guides/simple-profiling).

In a CLI tool, it's easy to add options to enable debugging. For libraries, it's common to use environment variables. For example, GTK has [`GTK_DEBUG`](https://developer-old.gnome.org/gtk4/stable/gtk-running.html).

In the past, I've struggled to come up with a good way of doing this for JavaScript libraries. One of the challenges is that your library can be consumed in many different ways — for example:

- Directly imported by a Node script.
- Compiled (e.g. by [ts-node][] or [vitest][]) and run on Node.
- Bundled (e.g. with Webpack) and then run in the browser.

[ts-node]: https://www.npmjs.com/package/ts-node
[vitest]: https://vitest.dev/
[Webpack]: https://webpack.js.org/

Another challenge is that some of the debugging options might want to write files to disk. In my current project, I'm generating WebAsssembly at runtime, and need a debug option to save a binary file with the contents of the Wasm module. This should work when running on Node, and gracefully fail in the browser.

## The solution (for Vite)

Here's the solution I came up with —

1. Create a separate module for debug code. Something like this:

  ```
  import * as fs from "node:fs"

  export const DEBUG = process.env.FIZZBUZZ_DEBUG !== ""
  ```

  For the pure Node.js case, nothing more is required. You could run your tests with debugging turned on with something like `FIZZBUZZ_DEBUG=true npm test`.

2. For code that's built with Vite or vitest, there two aspects to deal with: the environment variable, and the import of `"node:fs"`. Here's the config file I used:

  ```
  import { defineConfig, PluginOption, UserConfig } from "vite"

  function useShims(): PluginOption {
    const shims = {
      // Return stubs, rather than empty modules, to avoid errors from
      // `vite build`, e.g. '"writeFileSync" is not exported by "node:fs"'.
      "node:fs": "export function writeFileSync() {}",
    }

    return {
      name: "use-shim",
      enforce: "pre",
      resolveId: (id) => (id in shims ? id : undefined),
      load: (id) => (id in shims ? shims[id] : undefined),
    }
  }

  export default defineConfig(({ mode }) => {
    const devConfig: UserConfig = {
      build: {
        rollupOptions: {
          external: ["node:fs", "node:process"],
        },
      },
      define: {
        "process.env.FIZZBUZZ_DEBUG": JSON.stringify(process.env.FIZZBUZZ_DEBUG ?? ""),
      },
    }

    const prodConfig: UserConfig = {
      plugins: [useShims()],
      define: {
        "process.env.FIZZBUZZ_DEBUG": JSON.stringify(""),
      },
    }
    return mode === "production" ? prodConfig : devConfig
  })
  ```

### For the environment variable

In the development build, use the `define` option to statically replace all instances of the string `"process.env.FIZZBUZZ_DEBUG"` with **the current value of the variable at build time**.

In the production build, always set it to `""`.

### For the import of `"node:fs"`:

In development, the `external` option tells Vite not to include the contents of the module into my bundle, but instead try to load it at runtime. When the code runs on Node, it will successfully import the module.

In the browser, it seems that Vite returns an empty module. I should investigate more to better understand exactly what's happening.

For production, the `useShims` bit replaces `"node:fs"` with a stub module.

One catch is that any debugging code that uses `writeFileSync` needs to handle three different conditions:

1. `DEBUG=false`
2. `DEBUG=true` (and `"node:fs"` available).
3. `DEBUG=true` but `"node:fs"` NOT available.

You can handle these by guarding the code with something like `if (!DEBUG || !fs.writeFileSync) return`.
