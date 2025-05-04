# Single-pass code generation

Most of the compilers I've written are quite simple. Sometimes they're explicitly toys (e.g. for [Two little interpreters](https://dubroy.com/blog/two-little-interpreters/)), and other times, the situation just didn't call for anything complex.

Anyways, I've recently been working a compiler that targets WebAssembly, and I was looking for ways to improve the generated code without adding too much complexity. I found a couple of interesting approaches.

## Delayed code generation

The first thing I ran across was Ian Piumarta's thesis, [Delayed Code Generation in a
Smalltalk-80 Compiler](https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=7e11d58c3e0797f5f899fa207557cd82138bfc29).

> This thesis argues and demonstrates that it is possible to compile Smalltalk-80 directly into machine code for stock hardware, and to do this efficiently in terms of both compiler performance (the compiler must be small and fast) and generated code performance. The techniques developed for ‘delayed code generation’ in single-pass recursive descent compilation (or code generation by walking a parse tree) are applicable to almost any language.

I also found that Niklaus Wirth had used a similar approach. Mössenböck's [Compiler Construction: The Art of Niklaus Wirth](http://pascal.hansotten.com/uploads/books/art3.pdf) describes it like this:

> The spine of Wirth's code generators is what I call the _Item_ technique. It is described in Wirth's compiler book although it is not given a specific name. The general idea is that every value that turns up during code generation is described by a structure that is called an item. Items can describe constants, variables, intermediate results, or condition codes resulting from compare instructions. Every parsing procedure processes a language construct and returns an item that describes the value of this construct. Items are thus the attributes of the imaginary syntax tree. While the parsing procedures move top-down, the resulting items are propagated bottom-up thus creating more complex items and generating code alongside.

The way I think about it is that you use a temporary and local intermediate representation, rather than a persistent global one.

## Destination-driven code generation

This is another approach I learned about. The best description I found from Max Bernstein's [A quick look at destination-driven code generation](https://bernsteinbear.com/blog/ddcg/):

> The key insight is that in a recursive code generator, the caller of the recursive compilation step knows where it wants the result of the callee to go — so we should not be copying everything around through some result register like RAX. We should instead pass the destination we want as a parameter.

So, while delayed code generation involves information flowing _up_ the tree — from operands to operators — DDCG involves passing information _down_.

## Peephole optimization

Another trick is to do peephole optimization in the `emit` methods. In other words, the optimization is done incrementally, rather than as a separate pass.

E.g., here's [an example from the Lua bytecode compiler](https://github.com/lua/lua/blob/3dbb1a4b894c0744a331d4319d8d1704dc4ad943/lcode.c#L122C1-L144C2):

```c
/*
** Create a OP_LOADNIL instruction, but try to optimize: if the previous
** instruction is also OP_LOADNIL and ranges are compatible, adjust
** range of previous instruction instead of emitting a new one. (For
** instance, 'local a; local b' will generate a single opcode.)
*/
void luaK_nil (FuncState *fs, int from, int n) {
  int l = from + n - 1;  /* last register to set nil */
  Instruction *previous = previousinstruction(fs);
  if (GET_OPCODE(*previous) == OP_LOADNIL) {  /* previous is LOADNIL? */
    int pfrom = GETARG_A(*previous);  /* get previous range */
    int pl = pfrom + GETARG_B(*previous);
    if ((pfrom <= from && from <= pl + 1) ||
        (from <= pfrom && pfrom <= l + 1)) {  /* can connect both? */
      if (pfrom < from) from = pfrom;  /* from = min(from, pfrom) */
      if (pl > l) l = pl;  /* l = max(l, pl) */
      SETARG_A(*previous, from);
      SETARG_B(*previous, l - from);
      return;
    }  /* else go through */
  }
  luaK_codeABC(fs, OP_LOADNIL, from, n - 1, 0);  /* else no optimization */
}
```
