# Bun dev server

A couple years ago, I decided to stop using TypeScript for personal projects, because of how much complexity it added to the build process. So I've been excited to see [Bun](https://bun.sh/) emerge — and I've finally started using TypeScript for personal stuff again.

And, while Bun can directly execute[^1] TypeScript, many of my projects target the browser. So I still need some kind of development server to compile and bundle my TypeScript source code for the browser.

[^1]: Technically, Bun internally translates TypeScript into JavaScript before execution.

[Vite](https://vitejs.dev/) does a great job of this out of the box, but it adds a lot of complexity, since it's a wrapper around two separate bundlers: [Rollup](https://rollupjs.org/) and [esbuild](https://esbuild.github.io/).

Ideally, I wanted to find a solution using Bun's built-in bundler.

## The solution

First, I set up a Bun build script, which I use to bundle my library for release, in `scripts/build.ts`:

```ts
import type { BuildConfig } from "bun";

export const demoConfig: BuildConfig = {
  entrypoints: ["demo/app.ts"],
  minify: false,
  sourcemap: "external",
};

export const config: BuildConfig = {
  entrypoints: ["index.ts"],
  minify: true,
  sourcemap: "external",
};

Bun.build({
  ...config,
  outdir: "dist",
});
```

Then, I added a script to start a development web server in `scripts/serve.ts`. It uses imports `demoConfig` from the build script, and starts a server on port 3000.

```ts
import { demoConfig } from "./build";

const port = process.env.PORT || 3000;

try {
  Bun.serve({
    async fetch(req: Request): Promise<Response> {
      const url = new URL(req.url);
      switch (url.pathname) {
        case "/":
          return new Response(Bun.file("demo/index.html"));
        case "/bundle":
          const build = await Bun.build(demoConfig);
          return new Response(build.outputs[0], {
            headers: { "Content-Type": "application/javascript" },
          });
        default:
          const f = Bun.file("demo" + url.pathname);
          return (await f.exists())
            ? new Response(f)
            : new Response("404!", { status: 404 });
      }
    },
    port,
  });
  console.log("Server started at http://localhost:3000/");
} catch (e: any) {
  if ("code" in e && e.code === "EADDRINUSE") {
    console.log(
      `Port ${port} already in use. Try setting $PORT to another value.`,
    );
    process.exit(1);
  }
  throw e;
}
```

The key part is this — on requests to the `/bundle` endpoint, it builds and bundles the TypeScript sources using the `demoConfig`.

```ts
      switch (url.pathname) {
        // ...
        case "/bundle":
          const build = await Bun.build(demoConfig);
          return new Response(build.outputs[0]);
        // ...
      }
```

There are certainly other ways to do this, but this is working well for me. Bun's bundler is super fast, and my projects are generally small, so re-running on the bundler on every request hasn't been a problem.
