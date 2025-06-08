# Zig shadowing and builtins

A couple things I learned when I was playing with Zig earlier this year, but forgot to write up…

## No shadowing

Zig is the only language I know of that disallows "variable shadowing". As the docs say:

> Identifiers are never allowed to "hide" other identifiers by using the same name.

In other words, the following code is not allowed:

```zig
const pi = 3.14;

test "inside test block" {
    // Let's even go inside another block
    {
        var pi: i32 = 1234;
    }
}
```

I find this to be a really interesting design choice; I used to wonder why no languages (that I knew of) did this, especially educational languages.

## Builtins begin with `@`

As a consequence of the "no shadowing" rule, every builtin function would prevent user code from using that name. But in Zig, builtins are prefixed with `@`: `@addWithOverflow`, `@atomicLoad`, etc.

We have a similar problem in [Ohm](https://ohmjs.org). Ohm does allow shadowing, but it requires different syntax when you are overriding an existing rule (`:=`) vs. declaring a new rule (`=`). But, that means that it's a breaking change every time we introduce a new built-in rule, because user grammars that used to work will no longer be accepted. Not a huge deal, but I wonder if it would be better to do something like Zig.
