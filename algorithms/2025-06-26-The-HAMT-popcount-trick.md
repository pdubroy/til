# The HAMT popcount trick

I first heard of the [_hash array mapped trie_](https://en.wikipedia.org/wiki/Hash_array_mapped_trie) (HAMT) in the context of persistent data structures. Recently, I've been looking at how they are implemented. One neat thing is the technique used to store a sparse array in a space-efficient way, which took me a while to grok.

Suppose you want to store a mapping `byte -> int32`; assume that keys can be between 0..31 and that there are no collisions. You could store it densely, as an array of eight 32-bit values (32 bytes total). But, if the map will be mostly empty, a lot of that space is wasted.

HAMTs use a clever method of storing such a map without wasting space. Say you have map with entries `2 -> 965` and `6 -> 3042` — it's possible to store it like this:

```
[ XXXX ] <- metadata
[  965 ] <- entry for 2
[ 3042 ] <- entry for 6
```

That's just three int32 slots, or 12 bytes total. But, how do you know what key is associated with each entry? Here's how it works:

- Treat the metadata slot as a 32-bit bitmap. If the _n_th, bit is set, there is an entry for that key. So, in our case, the bitmap would have the 2nd and 6th bit set: `0x44`, or `0b1000100`.
- Determining if the map contains a given key is easy: `bitmap & (1 << k)`.
- To find the offset for a given key (e.g., `6`):
  * Use `(1 << k) - 1` to get a mask where all bits to the right of the _k_th bit are 1, and everything else is 0. E.g., `(1 << 6) - 1` is `0b111111` (six 1s).
  * Then, use that mask to get a portion of the metadata bitmap: `bitmap & mask`…
  * …and then use [`popcnt`](../compilers/2025-05-18-popcnt-and-lzcnt.md) to determine how many of the keys below `10` are present. That tells you the offset of the entry you're looking for! E.g., in our case, `popcnt(mask & bitmap)` is 1, which means that the map only has one entry with a key <6, and therefore the value for 6 is at offset 1.

Note that producing the mask with `(1 << k) - 1` assumes a [two's complement](https://en.wikipedia.org/wiki/Two%27s_complement) representation for negative numbers.
