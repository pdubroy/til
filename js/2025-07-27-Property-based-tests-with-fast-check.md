# Property-based tests with fast-check

I've been aware of [property-based testing](https://en.wikipedia.org/wiki/Property_testing) for a long time, but had never found the opportunity to use it — until this week.

I'm working on adding WebAssembly support to [Ohm](https://ohmjs.org), which involves a reimplementation of Ohm's core PEG parsing code. This week I was working on tracking the error position, so that when the parse fails, you can tell the user where the error occurred. I decided to write some property-based tests to make sure  the Wasm code reported the same error position as the JS implementation.

A quick Google suggested that [fast-check](https://fast-check.dev/) would be a good choice. After installing it (`pnpm install --save-dev fast-check`), I started with [the example in the tutorial](https://fast-check.dev/docs/tutorials/quick-start/our-first-property-based-test/#our-first-property) and before long was able to write the following test:

```js
import fc from 'fast-check';
import test from 'ava';


// Take some valid input, randomly corrupt it, and then check that the
// rightmostFailurePosition is the same as the JS parser reports.
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

// eslint-disable-next-line ava/no-skip-test
test('failure pos (fast-check)', async t => {
  const m = await wasmMatcherForGrammar(ns.LiquidHTML);
  t.notThrows(() => fc.assert(checkFailurePos(m), {numRuns: 50}));
});
```

I'll bet there are better ways to test this, but this has been helpful so far.

So every time I run my tests, fast-check generates and tests 50 invalid inputs. Just a few hours ago it uncovered a bug in my space-skipping logic. When it fails, it prints out something like the following:

```
Property failed after 27 tests␊
     { seed: 291650338, path: "325", endOnFailure: true }
     Counterexample: [2147483643,6]
     Shrunk 0 time(s)

     Hint: Enable verbose mode in order to have the list of all failing values encountered during the run
```

I can then edit replace `{numRuns: 50}` with `{ seed: 291650338, path: "325", endOnFailure: true }` to reproduce the failure. (Eventually I might implement a simpler way of doing it, but it's good enough for now.)

I do feel like there's a lot to learn to use property-based testing effectively; I'm definitely just scratching the surface. Would love pointers to any good resources y'all have!
