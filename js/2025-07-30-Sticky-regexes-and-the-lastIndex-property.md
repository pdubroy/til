# Sticky regexes and the `lastIndex` property

In JavaScript, there are a few different ways to match a regular expression against a string:

```javascript
/[a-z]/.exec('blah');
// > [ 'b', index: 0, input: 'blah', groups: undefined ]
'blah'.match(/[a-z]/);
// > [ 'b', index: 0, input: 'blah', groups: undefined ]
```

Sometimes I want to match at a particular input position. Unfortunately, none of the methods take a `startPos` argument, so I've always done something like this:

```javascript
input.slice(startPos).match(aRegExp);
```

## The `lastIndex` property

An "interesting" thing about JavaScript regexes is that they are stateful:

```
> const re = /[a-z]/g; // Match any character from a-z.
undefined
> re.exec('abc');
[ 'a', index: 0, input: 'abc', groups: undefined ]
> re.lastIndex
1
> re.exec('xyz');
[ 'y', index: 1, input: 'xyz', groups: undefined ]
```

The first call to `exec` sets `lastIndex` to 1; that's why the second call matches 'y' and not 'x'.

## `lastIndex` is writeable

I learned that the  `lastIndex` property of `RegExp` objects is a _writable_ property, and you can use that fact to begin matching at a particular input position:

```javascript
const re = /[a-z]/g;
re.lastIndex = 1;
re.exec('xyz'); // [ 'y', index: 1, input: 'xyz', groups: undefined ]
```

But, `lastIndex` is _only_ used if the regex uses the `g` (global) or `y` (sticky) flag.

## The sticky flag (`y`)

A regex with the sticky flag will only attempt to match at the `lastIndex` position:

```javascript
const re = /[a-z]/y;
re.lastIndex = 1;
re.exec('i18n'); // null
```

With the `g` flag, the call to `re.exec('i18n')` would have successfully matched at index 3.
