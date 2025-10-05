# WebAssembly library initialization patterns

I was curious how people are shipping WebAssembly as part of JavaScript libraries. There are two main questions:

1. How to bundle or fetch the .wasm payload, which may be relatively large.
2. How to deal with module instantiation, which is typically async.

In this post, I'm only concerned with #2 — how to deal with async module instantion.

## Async factory function as default export

Emscripten's [modularized output](https://emscripten.org/docs/compiling/Modularized-Output.html) option produces a module whose default export is an async factory function:

```js
import MyLib from './my-lib.js';
const myLib = await MyLib();
```

## Required async init

Another pattern I've seen is to export an async initialization function, which you're required to call before using the library. E.g., in [esbuild-wasm](https://esbuild.github.io/api/#browser):

```js
import * as esbuild from 'esbuild-wasm'

await esbuild.initialize({
  wasmURL: './node_modules/esbuild-wasm/esbuild.wasm',
})
```

And in the [Automerge unbundled example](https://automerge.org/docs/reference/library_initialization/#unbundled-vanilla-js):

```js
import * as AutomergeRepo from "https://esm.sh/@automerge/react@2.2.0/slim?bundle-deps";

await AutomergeRepo.initializeWasm(
  fetch("https://esm.sh/@automerge/automerge/dist/automerge.wasm")
);
```

[wasm-bindgen without a bundler](https://wasm-bindgen.github.io/wasm-bindgen/examples/without-a-bundler.html):

```
import init, { add } from './my_lib.js';
await init();
```

## Hidden async init

[PGlite](https://pglite.dev/) has a nice variation on the "required async init" pattern. You can synchronously initialize a `PGlite` instance:

```js
import { PGlite } from '@electric-sql/pglite'
const pg = new PGlite();
```

Internally, the constructor instantiates a Wasm module and stores the promise in the object's [`waitReady`](https://pglite.dev/docs/api#waitready) field. Most of the methods on the `PGlite` are async, and they await the promise.

## Top-level await

In principle, a library could use [top-level await](https://v8.dev/features/top-level-await) to do the initialization step internally, rather than requiring it in the application code. I'm not aware of any libraries that use this approach directly though.

It does have transitive effects on any code that imports the module:

> Here’s what happens when you use top-level await in a module:
>
> 1. The execution of the current module is deferred until the awaited promise is resolved.
> 2. The execution of the parent module is deferred until the child module that called `await`, and all its siblings, export bindings.
> 3. The sibling modules, and siblings of parent modules, are able to continue executing in the same synchronous order — assuming there are no cycles or other awaited promises in the graph.
> 4. The module that called `await` resumes its execution after the awaited promise resolves.
> 5. The parent module and subsequent trees continue to execute in a synchronous order as long as there are no other awaited promises.

In other words, for the application code, it's as if it awaited the `init` function at the top of the module.

## ES Module integration

Both Node and Deno now support importing Wasm modules directly:

```js
import { add } from "./add.wasm";

console.log(add(1, 2));
```

My understanding is that it's equivalent to the following code:

```js
const wasmInstance = await WebAssembly.instantiateStreaming(fetch("./add.wasm"));
const { add } = wasmInstance;
```

AFAIK, it has the same implications on module execution as an explicit top-level `await` does.

## Sychronous instantiation

A final option is to synchronously instantiate the module — either using Node's `readFileSync` to load from a file, or by embedding the module as base64:

```js
const bytes = Uint8Array.from(atob('AGFzbQEAAAABBwFgAn9/AX8DAgEABwcBA2FkZAAACgkBBwAgACABags='), c => c.charCodeAt(0));
const inst = new WebAssembly.Instance(new WebAssembly.Module(bytes));
console.log(inst.exports.add(2, 3)); // Prints 5
```

This is generally not recommended except for very small modules. Historically, the limit was 4KB, but most JS engines support larger modules now, and avoid long pauses via lazy compilation, etc.
