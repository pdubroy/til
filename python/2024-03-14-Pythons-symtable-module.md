# Python's symtable module

This week, I've been reworking some of the code for [WebAssembly from the Ground Up](https://wasmgroundup.com), the book that [Mariano](https://marianoguerra.github.io/) and I are writing together.

The code in question was related to the creation and manipulation of symbol tables. I was thinking about the API I wanted to present, and — as I often do — I wanted to look at some other implementations for reference.

Symbol tables are usually just an implementation detail of a compiler, so I thought I'd have to dig to find some examples. But, then I learned about Python's [`symtable` module](https://docs.python.org/3/library/symtable.html).

Here's a small example of how you can use it:

```python
import symtable

src = """
def foo():
  global y
  x = 3
  y = 4
"""

syms = symtable.symtable(src, "foo.py", 'exec')
assert syms.lookup('foo').is_namespace()
foo_ns = syms.lookup('foo').get_namespace()
assert foo_ns.lookup('x').get_name() == 'x'
assert foo_ns.lookup('y').is_global()
```
