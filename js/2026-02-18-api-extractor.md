# api-extractor

The new version of [ohm-js](https://www.npmjs.com/package/ohm-js) (v18), is [now in beta](https://ohmjs.org/blog/ohm-v18). It's written in TypeScript, whereas v17 was written in JavaScript with manually-updated type definitions.

I was looking for a way to make sure that I don't accidentally make changes to the API, which led me to [api-extractor](https://api-extractor.com):

> API Extractor is a TypeScript analysis tool that produces three different output types:
>
> 1. **API Report** - API Extractor can trace all exports from your project's main entry point and generate a report to be used as the basis for an API review workflow.
>
> 2. **.d.ts Rollups** - Similar to how Webpack can "roll up" all your JavaScript files into a single bundle for distribution, API Extractor can roll up your TypeScript declarations into a single .d.ts file.
>
> 3. **API Documentation** - API Extractor can generate a "doc model" JSON file for each of your projects. This JSON file contains the extracted type signatures and doc comments. The api-documenter companion tool can use these files to generate an API reference website, or you can use them as inputs for a custom documentation pipeline.

## How I'm using it

In each package, I have an `api-extractor.json` like this:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
  "mainEntryPointFilePath": "./dist/index.d.ts",
  "apiReport": {
    "enabled": true,
    "reportFolder": "./"
  },
  "newlineKind": "lf",
  "dtsRollup": {
    "enabled": false
  },
  "docModel": {
    "enabled": false
  },
  "messages": {
    "extractorMessageReporting": {
      "ae-missing-release-tag": { "logLevel": "none" },
      "ae-forgotten-export": { "logLevel": "none" }
    }
  }
}
```

Note that I'm only using API reports for now — no .d.ts rollup or documentation. (I'm using [tsdown](https://tsdown.dev) as well, which already bundles my types into a single .d.ts.)

Then, in my package.json, I have a package script named `api-report`:

```js
{
  "name": "@ohm-js/compiler",
  "version": "18.0.0-beta.8",
  // ...
  "scripts": {
    "api-report": "api-extractor run",
    // ...
  },
  // ...
}
```

This script runs in CI. When it's run, if the API report has changed, I get an error like this:

```
> @ohm-js/compiler@18.0.0-beta.8 api-report /Users/pdubroy/dev/ohmjs/ohm/packages/compiler
> api-extractor run


api-extractor 7.56.3  - https://api-extractor.com/

Using configuration from ./api-extractor.json
Analysis will use the bundled TypeScript version 5.8.2
Warning: You have changed the API signature for this project. Please copy the file "temp/compiler.api.md" to "compiler.api.md", or perform a local build (which does this automatically). See the Git repo documentation for more info.

API Extractor completed with warnings
 ELIFECYCLE  Command failed with exit code 1
```
