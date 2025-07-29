# Better fast-check error messages

In [Property-based tests with fast-check](./2025-07-27-Property-based-tests-with-fast-check.md), I shared the first property-based test that I added to the [Ohm](https://ohmjs.org) repo.

Today, I refactored it a bit to produce more useful error messages when it failed. Previously, the error messages looked like this:

```
Function threw:

  Error {
    message: `Property failed after 12 tests
    { seed: -297179171, path: "167", endOnFailure: true }
    Counterexample: [1815435807,5]
    Shrunk 0 time(s)

    Hint: Enable verbose mode in order to have the list of all failing values encountered during the run`,
  }
```

This was sufficient to reproduce the failure, but it doesn't give much info about _why_ it failed. Here's what the new version produces:

```
Function threw:

Error {
  message: `Property failed after 1 tests
  { seed: -1139159962, path: "0:6:0:0:0", endOnFailure: true }
  Counterexample: ["\\n{%- liquid\\n  assign swatch_value = null\\n  if swatch.image\\n    assign image_url = swatch.image | image_url: width: 50\\n    assign swatch_value = 'url(' | append: image_url | append: ')'\\n    assign swatch_focal_point = swatch.image.presentation.focal_point\\n  elsif swatch.color\\n    assign swatch_value = 'rgb(' | append: swatch.color.rgb | append: ')'\\n}\\n"]
  Shrunk 4 time(s)
  Got AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

  353 !== 352

      at file:///Users/pdubroy/dev/ohmjs/ohm/packages/wasm/test/test-failurePos.js:63:12
      …
  }
```

Notice that it not only includes the seed to reproduce the failure, but also:

- what the input string passed to the parser was
- the actual and expected values

## What I changed

Looking at my original code, I realized a few things that were less than ideal about it. Here's what it looked like:

```js
const checkFailurePos = matcher =>
  fc.property(
      fc.nat(), // Position to corrupt
      fc.integer({min: 1, max: 20}), // Number of characters to corrupt
      (posSeed, numChars) => {
        const pos = posSeed % Math.max(1, validInput.length - numChars);

        // Remove a slice of random amount of characters
        const newInput = validInput.slice(0, pos) + validInput.slice(pos + numChars);

        matcher.setInput(newInput);
        fc.pre(matcher.match() === 0);

        return (
          matcher.getRightmostFailurePosition() ===
        ns.LiquidHTML.match(newInput).getRightmostFailurePosition()
        );
      },
  );
```

There are a few things to notice:

- The data is generated from two values: a position and number of characters. I turn that into a meaningful domain object — a string to be parsed — _inside the predicate._ So fast-check doesn't recognize the string as the actual input to the test.
- I check the result by returning a boolean from the predicate, indicating whether the actual result matched the expected one.

Here's the new code:

```js
function arbitraryEdit(input) {
  return fc
    .tuple(
      fc.nat({max: input.length - 1}), // Position to edit
      fc.integer({min: 1, max: 20}) // Number of characters to delete
    )
    .map(([pos, numDeleted]) => {
      return input.slice(0, pos) + input.slice(pos + numDeleted);
    });
}

// A fast-check property that checks that:
// - for some randomly-corrupted input, which fails to parse
// - the rightmostFailurePosition reported by a JS matcher and a Wasm matcher
//   is the same.
const sameFailurePos = (t, wasmMatcher) =>
  fc.property(arbitraryEdit(validInput), input => {
    wasmMatcher.setInput(input);
    fc.pre(wasmMatcher.match() === 0);
    assert.equal(
      ns.LiquidHTML.match(input).getRightmostFailurePosition(),
      wasmMatcher.getRightmostFailurePosition()
    );
  });
```

- I've got a clearer separation between the data generation and the predicate, and by using [fast-check's `map` combiner](https://fast-check.dev/docs/core-blocks/arbitraries/combiners/any/#map), I ensure that fast-check treats the string as the test input.
- In the predicate, I use an assert (using Node's `assert` package) rather than returning a boolean.

The last step was to use fast-check's `verbose` and `includeErrorInReport` options:

```
test('failure pos (fast-check)', async t => {
  const m = await wasmMatcherForGrammar(ns.LiquidHTML);
  t.notThrows(() => fc.assert(sameFailurePos(t, m), {verbose, includeErrorInReport: true}));
});
```
