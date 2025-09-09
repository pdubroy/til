# Lightweight TypeScript support in Node

I like TypeScript (the language), but it's always bothered me how complex the tooling and configuration can be. Now that Node.js supports type stripping, it's become much simpler to use TypeScript in Node projects.

What I was looking for:

- No build step required to run the tests.
- A single dev dependency (`typescript`) and compiler / build tool (`tsc`).

Yesterday I finally learned [the right options for tsconfig.json to make this work](https://nodejs.org/api/typescript.html#type-stripping):

```json
{
  "compilerOptions": {
     "target": "esnext",
     "module": "nodenext",
     "rewriteRelativeImportExtensions": true,
     "erasableSyntaxOnly": true,
     "verbatimModuleSyntax": true
  }
}
```

- [`rewriteRelativeImportExtensions`](https://www.typescriptlang.org/tsconfig/#rewriteRelativeImportExtensions): This lets you use the `.ts` extension for your imports (file extensions are mandatory in ES modules), and tells `tsc` to rewrite them to `.js` in the output files.
- [`erasableSyntaxOnly`](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly): Disallows the few TypeScript constructs that can't be trivially stripped when converting to JS.
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax): Simplifies the rules around stripping import statements — `import type` statements are always removed; other imports are always kept.

With these options, my TypeScript code "just works" with Node, and I use `tsc --noEmit` before committing, and `tsc` to compile to JS before publishing.
