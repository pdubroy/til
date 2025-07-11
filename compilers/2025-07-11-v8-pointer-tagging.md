# V8 Pointer tagging

Back when I worked on J9 (see [Memories of some fantastic internships](https://dubroy.com/blog/memories-of-some-fantastic-internships/)), I learned about _tagged integers_ as a PL implementation technique:

> A common technique to avoid allocating small integers, is to use the least significant bit to
> distinguish small integers and pointers. Assuming pointers are always aligned to machine words,
> the least significant bit of a pointer is always zero, and we can set it to one for small integers.
> This encoding is widely used, ranging from statically typed languages like OCaml to dynamic
> languages like Ruby, Common Lisp, and some JavaScript implementations.

(_From [What About the Integer Numbers? Fast Arithmetic with Tagged Integers — A Plea for Hardware Support](https://www.microsoft.com/en-us/research/publication/what-about-the-integer-numbers-fast-arithmetic-with-tagged-integers-a-plea-for-hardware-support/) by Dan Leijen_)

I always thought that this is what V8 did for small integers (aka _Smis_), but today I learned that it does the opposite:

> V8 always allocates objects in the heap at word-aligned addresses, which allows it to use the 2 (or 3, depending on the machine word size) least significant bits for tagging. On 32-bit architectures, V8 uses the least significant bit to distinguish Smis from heap object pointers. For heap pointers, it
> uses the second least significant bit to distinguish strong references from weak ones:
>
> ```
>                         |----- 32 bits -----|
> Pointer:                |_____address_____w1|
> Smi:                    |___int31_value____0|
> ```
>
> where w is a bit used for distinguishing strong pointers from the weak ones.

(_From [Pointer compression in V8](https://v8.dev/blog/pointer-compression)_)

So V8 tags _pointers_, and Smis are untagged.
