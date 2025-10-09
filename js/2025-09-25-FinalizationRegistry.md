# FinalizationRegistry

Some JavaScript APIs require some kind of manual resource management. For example:

- three.js: `myBufferGeometry.dispose()` to release GPU resources.
- [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API): `reader.releaseLock()` to allow another reader to read from the stream.
- In WebAssembly, releasing some previously-allocated linear memory.

In some scenarios, you can use `try`/`finally` to ensure that the resources are always freed. But, what if you forget? And, as a library author, how can you make things easier on your users?

## FinalizationRegistry

A `FinalizationRegistry` lets you request a callback when a value is no longer referenced. It was added in ES2021[^1], along with weak references (`WeakRef`)[^2]. Here's how it works —

[^1]: [caniuse: FinalizationRegistry](https://caniuse.com/mdn-javascript_builtins_finalizationregistry)
[^2]: [caniuse: WeakRef](https://caniuse.com/mdn-javascript_builtins_weakref)

First, you create the registry, specifying the callback to be called:

```javascript
const registry = new FinalizationRegistry((resourceId) => {
  // …
});
```

Then, you register objects with the registry:

```javascript
registry.register(someObj, someResourceId);
```

Then, when `someObj` is eligible for garbage collection, the registry will (ideally) call your callback passing `someResourceId` as an argument.

Notes:

- This design avoids the mistake that Java made, where finalizers can still access the almost-dead object, and "resurrect" it by making it reachable again.
- **It's unreliable:** Quoting [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry):
  > A conforming JavaScript implementation, even one that does garbage collection, is not required to call cleanup callbacks. When and whether it does so is entirely down to the implementation of the JavaScript engine. When a registered object is reclaimed, any cleanup callbacks for it may be called then, or some time later, or not at all.

See also:

- [Cloudflare: We shipped FinalizationRegistry in Workers: why you should never use it](https://blog.cloudflare.com/we-shipped-finalizationregistry-in-workers-why-you-should-never-use-it/)
