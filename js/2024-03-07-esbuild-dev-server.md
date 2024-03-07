# esbuild dev server

What I wanted was set of scripts just like I described in [Bun dev server](js/2024-02-03-Bun-dev-server.md), but for [esbuild API](https://esbuild.github.io/) rather than Bun:

> So I still need some kind of development server to compile and bundle my TypeScript source code for the browser.
>
> [Vite](https://vitejs.dev/) does a great job of this out of the box, but it adds a lot of complexity, since it's a wrapper around two separate bundlers: [Rollup](https://rollupjs.org/) and [esbuild](https://esbuild.github.io/).
>
> Ideally, I wanted to find a solution using Bun's built-in bundler.

## The solution

Here's `scripts/build.ts`:

```ts
import * as url from 'node:url';

import * as esbuild from 'esbuild'

export const mainConfig: esbuild.BuildOptions = {
  entryPoints: ['bootstrap.js'],
  outdir: 'build',
  bundle: true,
  format: 'esm'
};

export const demoConfig: esbuild.BuildOptions = {
  ...mainConfig,
  entryPoints: ['index.js'],
  minify: false,
};

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  await esbuild.build(mainConfig)
}
```

And `scripts/server.ts`:

```ts
import * as esbuild from 'esbuild'

import { demoConfig } from './build'

const ctx = await esbuild.context(demoConfig)
const { port } = await ctx.serve({
  servedir: '.',
})
console.log(`Server started at http://localhost:${port}/`);
```

It's also possible to do [live reloading](https://esbuild.github.io/api/#live-reload) but I haven't tried that yet.
