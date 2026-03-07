# Multithreaded WebAssembly

Just like in JavaScript, you can do shared memory multithreading in WebAssembly! I've long known this was _possible_, but until the other day, had never actually played with it myself. So I decided to put together a small, self-contained example.

(This is for Node, but it's pretty much the same in the browser.)

## The code

Let's start with the code for the worker, in `worker.js`:

```js
// In the browser: `self.onmessage` and `self.postMessage` instead of `parentPort`.
import { parentPort } from "worker_threads";

parentPort.on("message", async ({ compiledModule, memory, iterations, workerId }) => {
  // Create a module instance from the compiled module, importing `memory`.
  const instance = await WebAssembly.instantiate(compiledModule, {
    env: { memory },
  });
  instance.exports.workerId.value = workerId; // Set the global.
  for (let i = 0; i < iterations; i++) instance.exports.add();
  parentPort.postMessage({ id: workerId }); // Tell the parent we're done.
});
```

Note that the compiled module and a reference to the memory are sent from the parent to the worker. More details on that soon.

And here's the main thread code, in `multicore-wasm.js`:

```js
import { Worker } from "worker_threads";
import initWabt from "wabt";

const wabt = await initWabt();

const watSource = `
(module
  ;; Import the shared memory.
  (import "env" "memory" (memory 1 1 shared))
  ;; Exported global (each worker gets its own copy of globals).
  (global (export "workerId") (mut i32) (i32.const 0))
  (func (export "addId") (result i32)
    ;; mem[0] += workerId
    i32.const 0
    global.get 0
    i32.atomic.rmw.add))
`;
const { buffer } = wabt
  .parseWat("inline", watSource, { threads: true })
  .toBinary({});
const compiledModule = await WebAssembly.compile(buffer);

// IDs for each worker. Primes, because why not :-)
const workerIds = [3, 5, 7, 11];
const iterations = 100;

const expectedResult = workerIds.map(id => id * iterations).reduce((a, b) => a + b, 0);

const memory = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });

let doneCount = 0;
for (let id of workerIds) {
  // In the browser: `new Worker("worker.js")`
  const worker = new Worker(new URL("./worker.js", import.meta.url));
  worker.postMessage({ compiledModule, memory, iterations, workerId: id });
  // Wait for a message from the worker indicating that it's done.
  worker.on("message", ({ id }) => {
    console.log(`Worker #${id} done`);
    worker.terminate();
    if (++doneCount === workerIds.length) {
      const view = new Int32Array(memory.buffer);
      const result = Atomics.load(view, 0);
      console.log(`Ok? ${result === expectedResult}`);
    }
  });
}
```

## Details

### Structured cloning of `WebAssembly.Module`

Normally you'd instantiate a Wasm module with [`instantiateStreaming`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/instantiateStreaming_static), which gives you a _module instance_. Here, we use `WebAssembly.compile`, which gives us a [`WebAssembly.Module`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Module). This is a stateless object that is _structured-cloneable_, which allows it to be safely shared across realm boundaries.

Serialization (an implicit part of structured cloning) of WebAssembly modules is defined in [§3 of the WebAssembly Web API](https://www.w3.org/TR/wasm-web-api-2/#serialization), which says:

> Engines should attempt to share/reuse internal compiled code when performing a structured serialization, although in corner cases like CPU upgrade or browser update, this might not be possible and full recompilation may be necessary.

### Shared memory

`WebAssembly.Memory` objects also support structured cloning. When we pass `shared: true`, the `buffer` property is a [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer):

> The structured clone algorithm accepts `SharedArrayBuffer` objects and typed arrays mapped onto `SharedArrayBuffer` objects. In both cases, the `SharedArrayBuffer` object is transmitted to the receiver resulting in a new, private `SharedArrayBuffer` object in the receiving agent (just as for `ArrayBuffer`). However, the shared data block referenced by the two `SharedArrayBuffer` objects is the same data block, and a side effect to the block in one agent will eventually become visible in the other agent.

### Atomic add

The last piece of the puzzle is the `i32.atomic.rmw.add` instruction used in the `addId` function:

```
  (func (export "addId") (result i32)
    ;; mem[0] += workerId
    i32.const 0
    global.get 0
    i32.atomic.rmw.add))
```

This instruction is defined in the [threads proposal](https://github.com/WebAssembly/threads/blob/main/proposals/threads/Overview.md) (a Stage 4 proposal, so not finalized yet), which defines "a new shared linear memory type and some new operations for atomic memory access".

`i32.atomic.rmw.add` is equivalent to `LOCK XADD` on x86. As described in the threads proposal:

> Atomic read-modify-write (RMW) operators atomically read a value from an address, modify the value, and store the resulting value to the same address. All RMW operators return the value read from memory before the modify operation was performed.

So `i32.atomic.rmw.add` atomically takes two parameters from the stack: the dest offset in memory, and the addend. It leaves the previous value on the stack, which becomes the return value of `addId`.
