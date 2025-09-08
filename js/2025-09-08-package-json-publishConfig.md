# `publishConfig` in package.json

Now that [Node.js supports type stripping](https://nodejs.org/en/learn/typescript/run-natively#running-typescript-natively), it's easier to use TypeScript in Node projects without a separate bundler or build tool.

## The problem

I have a couple of TypeScript packages in a monorepo. When running my tests locally, I wanted the package entry points to be TypeScript. So I set the `"main"` field in package.json to `"src/index.ts"`.

But when I publish the packages, I want to ship JavaScript (with the types in a `.d.ts` file). I wondered how I could easily change the entry point before publishing.

## The solution: `publishConfig`

The package.json [`publishConfig`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#publishconfig) option lets you override fields in package.json before the package is published (technically, before it is _packed_). So here's what it looks like in my case:

```json
{
  // …
  "main": "src/index.ts",
  "publishConfig": {
    "main": "dist/index.js"
  },
  // …
}
```

This is turned into `"main": "dist/index.js"` in the published package.
