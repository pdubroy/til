# Faster formatting and linting

I'm a big fan of using tools like prettier and eslint to keep coding style consistent and to avoid problematic patterns. But, in bigger repos, formatting and linting everything can be slow. You can use tools like [lint-staged][] to avoid touching files that haven't changed, but then you have another dependency to configure, debug, upgrade, etc.

[lint-staged]: https://www.npmjs.com/package/lint-staged

Recently, I noticed that running `pnpm format` in the [Ohm repo](https://github.com/ohmjs/ohm) took over 4 seconds to format and lint everything, which is way. too. long. With a few small changes, I was able to get it down to under a second.

## prettier -> biome

The first step was to replace prettier with [biome](https://biomejs.dev). This was easy:

```
pnpm add -D @biomejs/biome
pnpm exec biome init
pnpm exec biome migrate prettier --write
```

(IIRC it didn't perfectly migrate my prettier configuration, but it was easy to fix up the Biome config manually.)

With biome, formatting takes 86ms, vs ~1.5s with prettier — a 16x speedup.

## eslint --cache

Biome also has a linter mode, which is partially compatible with ESLint. And there are a number of other "fast ESLint replacement" tools, including [oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [rslint](https://rslint.rs). A quick experiment with a few of them showed that none of them would be a drop-in replacement (for our use cases at least). So I decided to stick with ESLint.

First, I tried the new [multithread linting feature](https://eslint.org/blog/2025/08/multithread-linting/), but that didn't actually lead to any speedup. But, from that blog post, I discovered the `--cache` option — now I run eslint like this:

```
eslint --cache --fix .
```

## Results

Cold disk cache:

```
$ hyperfine -p 'sync && sudo purge' bin/format.sh
Benchmark 1: bin/format.sh
  Time (mean ± σ):     919.1 ms ±  64.2 ms    [User: 430.4 ms, System: 226.0 ms]
  Range (min … max):   849.2 ms … 1069.0 ms    10 runs
```

Warm:

```
$ hyperfine --warmup 3 bin/format.sh
Benchmark 1: bin/format.sh
  Time (mean ± σ):     318.2 ms ±   8.1 ms    [User: 461.8 ms, System: 95.4 ms]
  Range (min … max):   296.8 ms … 325.4 ms    10 runs
```

919ms when the disk cache is cold, 318ms when it's warm — and it was 4.9s (cold) / 4.4s (warm). Nice! 🙌
