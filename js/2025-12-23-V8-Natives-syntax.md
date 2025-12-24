# V8 Natives syntax

V8 has a number of built-in, runtime support functions that are written in C++. For debugging purposes, if you run with the `--allow-natives-syntax` flag, it's possible to call these functions directly from JavaScript with a `%` prefix. For example:

```js
function getTypeTagged(node) {
  return node.type;
}

console.log('=== Optimization Status (after warmup) ===');
const taggedStatus = %GetOptimizationStatus(getTypeTagged);
console.log(`getTypeTagged status:  ${taggedStatus}`);
```

The full list of functions is in [src/runtime/runtime.h](https://github.com/v8/v8/blob/main/src/runtime/runtime.h) in the V8 source. Here are a few that I found useful/interesting:

- `%GetOptimizationStatus`
- `%HaveSameMap`
- `%HasFastProperties`
