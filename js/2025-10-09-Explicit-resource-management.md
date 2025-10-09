# Explicit resource management

After learning about [FinalizationRegistry](./2025-09-25-FinalizationRegistry.md), I also learned about the [`using` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using):

> The `using` declaration declares block-scoped local variables that are synchronously disposed. Like `const`, variables declared with `using` must be initialized and cannot be reassigned. The variable's value must be either `null`, `undefined`, or an object with a `[Symbol.dispose]()` method. When the variable goes out of scope, the `[Symbol.dispose]()` method of the object is called, to ensure that resources are freed.

It's useful in scenarios where you might otherwise use a `try`/`finally`, e.g.:

```js
let normalMap;
try {
  tex = textureLoader.load('muppet.jpg');
  tex.doSomething();
  // …
} finally {
  tex.dispose();
}
```

With a `using` statement, and assuming the texture object implemented `[Symbol.dispose]()`, you could write it like this instead:

```js
using tex = textureLoader.load('muppet.jpg');
tex.doSomething();
```

`[Symbol.dispose]()` will be called when `tex` goes out of scope. Unlike `FinalizationRegistry` — but just like a `finally` block — it's _guaranteed_ to be called, so you can depend on it (in environments that support it).

It's currently supported in Chromium-based browsers, Node, and Firefox, but not yet in Safari. It's also been supported in TypeScript since v5.2, which was released in August 2023.

## Required dispose

A non-obvious thing is how to deal with objects that _must_ be disposed. In other words, if a programmer accidentally writes `const` instead of `using`, can we catch it? For many scenarios, we can — by writing a getter for `[Symbol.dispose]()`:

```js
import assert from 'node:assert/strict';

class MyResource {
  constructor() {
    this._using = false;
  }

  doSomething() {
    assert(this._using, 'Did you forget `using`?');
    // …
  }

  get [Symbol.dispose]() {
    this._using = true;
    return () => {
      // Actual dispose logic goes here.
    }
  }
}

using res1 = new MyResource(); // ok

const res2 = new MyResource();
res2.doSomething(); // Throws
```
