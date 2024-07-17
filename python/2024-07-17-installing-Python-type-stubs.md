# Installing Python type stubs

If you're using a third-party library that doesn't ship with type hints, how can you add them yourself?

We're using [pyimgui](https://pyimgui.readthedocs.io/) on a project that I'm working on, and I was getting sick of seeing the red squigglies under every imgui function call.

![Screnshot of some Python source code, with a wavy red underline under the code `imgui.selectable(name, is_selected)`](../images/imgui-squigglies.png)

## Typeshed

First I learned about [Typeshed](https://github.com/python/typeshed), which contains third-party stubs for lots of popular libraries (similar to the [DefinitinlyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) project for TypeScript.) However, they don't have any stubs for pyimgui.

## Installing type stubs locally

So I search a bit more and found [denballakh/pyimgui-stubs](https://github.com/denballakh/pyimgui-stubs). But, I didn't know how to install these in my project!

I'm using [Zed](https://zed.dev/), which uses [Pyright](https://github.com/microsoft/pyright) as the Python language server. Here's how I installed the stubs:

- I created a `typings` directory in my project root, with a `imgui` subdirectory.
  - According to the [Pyright documentation](https://github.com/microsoft/pyright/blob/main/docs/configuration.md), "each package's type stub file(s) are expected to be in its own subdirectory".
- I put the stubs (from [imgui.pyi](https://github.com/denballakh/pyimgui-stubs/blob/master/imgui.pyi)) into a file named `__init__.pyi` in the `imgui` directory.

That's it. No more red squigglies!

## Notes

- Our project uses a monorepo structure, managed by [rye](https://rye.astral.sh/). I originally tried to put the stubs in a `typings` directory of the package that uses imgui, but that didn't work.
- It seems that it's also possible to put the stubs in a directory with a different name, if you specify the `stubPath` option in the Pyright config. But `typings` in the default path, so I went with that.
