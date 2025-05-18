# The `popcnt` and `lzcnt` instructions

This week I was working on [some WebAssembly code involving math on powers of two](https://bsky.app/profile/dubroy.com/post/3lpcbstxi6g2a), and I discovered Wasm's `popcnt` and `clz` instructions. And then I was surprised to learn that these map to equivalent x86 instructions, which I had never heard of.

## What they do

- [`popcnt`](https://www.felixcloutier.com/x86/popcnt) (short for "population count") counts the number of non-zero bits in the binary representation of a number. Wasm has `i32.popcnt`, `i64.popcnt`, and the SIMD instruction `i8x16.popcnt`.
- [`lzcnt`](https://www.felixcloutier.com/x86/lzcnt) counts the number of leading zero bits (_leading_ meaning "most signficant"). Wasm has `i32.clz` and `i64.clz`.

## Trivia

I wondered why I'd never encountered the x86 instructions before. Turns out that they are somewhat recent (depending on your definition of recent anyways) — `popcnt` was first supported by Intel in 2008, and `lzcnt` in 2013.

Vaibhav Sagar's [You Won’t Believe This One Weird CPU Instruction!](https://vaibhavsagar.com/blog/2019/09/08/popcount/) has some interesting trivia about `popcnt` — apparently it's known as "the NSA instruction"?
