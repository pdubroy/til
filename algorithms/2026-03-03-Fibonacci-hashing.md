# Fibonacci hashing

It comes up rarely, but on a few projects I've wanted a dead simple hash table implementation. Most recently, it was for an experiment in the [Ohm WebAssembly compiler](https://ohmjs.org/blog/ohm-v18). When I'm compiling a grammar, I assign each rule name a unique ID, but I wanted a fixed size cached (e.g. 8 or 32 items) keyed by rule ID.

I discovered [Fibonacci hashing, aka "Knuth's muliplicative method"](https://probablydance.com/2018/06/16/fibonacci-hashing-the-optimization-that-the-world-forgot-or-a-better-alternative-to-integer-modulo/):

> So here's the idea: Let's say our hash table is 1024 slots large, and we want to map an arbitrarily large hash value into that range. The first thing we do is we map it using the above trick into the full 64 bit range of numbers. So we multiply the incoming hash value with 2^64/φ ≈ 11400714819323198485. (the number 11400714819323198486 is closer but we don't want multiples of two because that would throw away one bit) Multiplying with that number will overflow, but just as we wrapped around the circle in the flower example above, this will wrap around the whole 64 bit range in a nice pattern, giving us an even distribution across the whole range from 0 to 2^64. To illustrate, let's just look at the upper three bits. So we'll do this:
>
> ```
> size_t fibonacci_hash_3_bits(size_t hash)
> {
>     return (hash * 11400714819323198485llu) >> 61;
> }
> ```
>
> All we have to do to get an arbitrary power of two range is to change the shift amount. So if my hash table is size 1024, then instead of just looking at the top 3 bits I want to look at the top 10 bits. So I shift by 54 instead of 61. Easy enough.

It turns out the Linux kernel has used this for ~6 years; here's the comment from [include/linux/hash.h](https://github.com/torvalds/linux/blob/af4e9ef3d78420feb8fe58cd9a1ab80c501b3c08/include/linux/hash.h#L19):

```c
/*
 * This hash multiplies the input by a large odd number and takes the
 * high bits.  Since multiplication propagates changes to the most
 * significant end only, it is essential that the high bits of the
 * product be used for the hash value.
 *
 * Chuck Lever verified the effectiveness of this technique:
 * http://www.citi.umich.edu/techreports/reports/citi-tr-00-1.pdf
 *
 * Although a random odd number will do, it turns out that the golden
 * ratio phi = (sqrt(5)-1)/2, or its negative, has particularly nice
 * properties.  (See Knuth vol 3, section 6.4, exercise 9.)
 *
 * These are the negative, (1 - phi) = phi**2 = (3 - sqrt(5))/2,
 * which is very slightly easier to multiply by and makes no
 * difference to the hash distribution.
 */
#define GOLDEN_RATIO_32 0x61C88647
#define GOLDEN_RATIO_64 0x61C8864680B583EBull
```

## Why would you use this?

(I may get some details of this explanation wrong, because hashing and hash table sizing are a surprisingly complex subject!)

If I understand correctly, it makes sense to use this if (a) you don't have access to a good hash function, and (b) you want power-of-two table sizes, and/or (c) you want the bucket calculation operation to be as fast as possible. (A multiplication plus a shift is significantly faster than modulo/division.)
