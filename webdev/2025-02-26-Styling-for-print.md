# Styling for print

I'm working on official PDFs for [our WebAssembly book](https://wasmgroundup.com), and it's the first time I've ever had to care about print styles in CSS.

## Allow or prevent page breaks with `break-inside`

One issue I ran into was page breaks in awkward places. In fixing that, I learned about these three CSS properties:

- [`break-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside)
- [`break-before`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-before)
- [`break-after`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-after)

## The `beforeprint` / `afterprint` events

Another thing learned is that certain style properties (e.g. CSS transforms, absolute positioning?) don't play well with the page break logic. My solution was to make some changes to the DOM before printing to deal with those on a case-by-case basis.

You can do that with the [`beforeprint` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeprint_event).
