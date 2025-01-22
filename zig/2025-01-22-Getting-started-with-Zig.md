# Getting started with Zig

## Installation

I used [mise](https://mise.jdx.dev/):

```sh
mise install zig && mise use -g zig@latest
```

## Setting up a new project

I ran the following to generate the boilerplate for a new Zig project:

```sh
zig init
```

## Misc notes

- The build & test configuration is in build.zig. That's what determines what subcommands you can use with `zig build`.
- Seems like it's standard to support the following:
  * `zig build`
  * `zig build run` to run the executable.
  * `zig run test` to run the tests.
- **NOTE:** by default, Zig's test runner only produces output when the tests fail! This tripped me up for a few minutes.
- The build.zig.zon file is similar to package.json, and should be under source control.
- There's no built-in command to rebuild / re-run the tests whenever a file changes, but `mise watch test` works well with the following in .mise.toml:
  ```
  [tasks]
  build = "zig build"
  test = "zig build test"
  ```
