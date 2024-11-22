# Longer V8 stack traces

I didn't learn this one today. But, I haven't done it in a while and had to look it up today, so it seemed worth writing up.

By default, V8's stack traces are limited to 10 entries. From the [V8 stack trace API docs](https://v8.dev/docs/stack-trace-api):

> We collect 10 frames because it is usually enough to be useful but not so many that it has a noticeable negative performance impact

There are a few different ways to change it:

## `Error.stackTraceLimit`

One way to change the limit is to assign a value to `Error.stackTraceLimit` before the error occurs. For example:

```js
Error.stackTraceLimit = Infinity;
```

## `NODE_OPTIONS`

```sh
$ NODE_OPTIONS="--stack-trace-limit=100" npm test
```

## Node CLI

```sh
$ node --stack-trace-limit 100 my-script.js
```
