# Branded types in TypeScript

TypeScript is _structurally typed_: the type system doesn't distinguish between types that are structurally identical. By sometimes you want something more like _nominal_ typing (like C, Java, Swift, Rust, etc.)

In TypeScript, it's possible to do that via a pattern known as _branded types_. I first heard about this a few months ago, but really only learned how it works the other day.

## An example

The book _Learning TypeScript_ uses [the example of currency conversion](https://www.learningtypescript.com/articles/branded-types). Suppose you have the following types:

```typescript
type Euro = number;
type USD = number;
```

…and you wanted to prevent mistakes with mixing currencies, and you don't want to change the runtime representation. Enter branded types!

## Branded types

Here's how we can address this with branded types:

```typescript
type Currency<T> = number & { __brand: T };
type Euro = Currency<"EUR">;
type USD = Currency<"USD">;

const eur = (amount: number) => amount as Euro;
const usd = (amount: number) => amount as USD;

function usdToEur(amount: USD): Euro {
  return eur(amount * 0.87);
}
usdToEur(usd(35)); // this works
// `usdToEur(35)` fails to compiile:
//   Argument of type 'number' is not assignable to parameter of type 'USD'.
//    Type 'number' is not assignable to type '{ __brand: "USD"; }'.(2345)```

Note that this is purely in the type system — the runtime values are just numbers. As _Learning TypeScript_ puts it:

> Branded types are a useful lie to the type system: our positive numbers will never actually have that `__brand` property. We're just making sure that no developer accidentally provides a value of a non-branded type to a location that requires one that is branded.

Also, the name `__brand` is not important here — we could have used `__currency` or any other name we wanted.

## Preventing forging

When you use a regular property like `__brand`, it doesn't prevent someone from forging values:

```typescript
import {usdToEur} from "./currency.ts";

type Greenbux = number & { __brand: "USD" };
usdToEur(50 as Greenbux);
```

To protect against this, you can use a Symbol for the property:

```typescript
const brand = Symbol();
type Currency<T> = number & { [brand]: T };
type USD = Currency<"USD">;
```

If you do it this way, it's no longer purely in the types — your generated JS code will have a `const brand = Symbol()` (though it's never used).

To eliminate that, you can use `declare const` with [`unique symbol`](https://www.typescriptlang.org/docs/handbook/symbols.html#unique-symbol):

```typescript
declare const brand: unique symbol;
type Currency<T> = number & { [brand]: T };
type USD = Currency<"USD">;
```

AFAIK, this is equivalent to the previous example, but it's a type-only declaration.
