# Set `difference` and `symmetricDifference`

I just spent an annoying 30 minutes debugging an issue caused by a silly mistake —

I wanted to verify that two sets had the same contents. So I wrote something like this:

```js
assert(newSet.difference(oldSet).size === 0, 'sets are different!')
```

But this doesn't detect if `oldSet` has some items that aren't in `newSet`! What I _should_ have been using was `symmetricDifference`:

```js
assert(newSet.symmetricDifference(oldSet).size === 0, 'sets are different!')
```

Both of these methods are [Baseline 2024](https://web.dev/baseline/2024) features.

## On the names

Swift's name for `difference` is `subtracting`, which less confusing imo.

I decided to see where the naming was discussed on the original TC39 proposal, and found [tc39/proposal-set-methods#7](https://github.com/tc39/proposal-set-methods/issues/7), with a the following [comment from tabatkins](https://github.com/tc39/proposal-set-methods/issues/7#issuecomment-359982779)

> Sorry for this being back-and-forth, but difference has the same lack of implicit ordering as `complement` did — it's not immediately, intuitively clear which element's values are retained. `minus` and `subtract` are both good; `removeAll`, while it implies mutation semantics, is also _extremely_ clear and good in this regard.
>
> Related: "symmetricDifference" vastly exceeds my design instincts for what is an allowable level of spelling difficulty in an API. "symmetric" is not an easy word to spell (my fingers just now tried to type it with a single "m"!), and combined with another 10 letters after, it's huge and terrible. `xor` has a non-obvious meaning for many people, including native English speakers, but it's short and easy to spell; unsure if it's good enough or not.

Interestingly, the conclusion in that thread was to use `except`. There was further discussion in [#24: Method names should pick a theme](https://github.com/tc39/proposal-set-methods/issues/24), but I couldn't figure out where (or why) they decided on `difference`.
