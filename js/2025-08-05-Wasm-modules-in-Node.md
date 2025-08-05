# Wasm modules in Node

Node 24.5.0, which was [released last week](https://nodejs.org/en/blog/release/v24.5.0), now supports Wasm modules out of the box! (Previously, it was available under the `--experimental-wasm-modules` flag.)

## Example

Let's look at an example. Here's the .wat for a simple module with a single export: an `add` function that adds two integers:

```wat
(module
  (func $add (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    i32.add)
  (export "add" (func $add)))
```

After compiling this to .wasm (e.g. with `wat2wasm add.wat`), you can now import it like so:

```js
import { add } from './add-with-imports.wasm';

console.log(add(2, 3)); // prints 5
```

### Imports

What about imports? Node will handle those transparently, by trying to import a module with that name. For example:

```wat
(module
  (import "./log.js" "log2" (func $log2 (param i32) (param i32)))
  (func $add (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    call $log2
    local.get $a
    local.get $b
    i32.add)
  (export "add" (func $add)))
```

Imports in WebAssembly always have a _module name_ (`"./log.js"`) and an _item name_ (`"log2"`). Conveniently, these can be mapped directly to ES modules — so we can import this module just like before, and it will just work.

_ps - If messing around with JavaScript and Wasm sounds like fun, you should check out [WebAssembly from the Ground Up](https://wasmgroundup.com)._
