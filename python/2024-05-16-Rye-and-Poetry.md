# Rye and Poetry

I've been using Python for a little over 20 years, and it feels like the packaging and dependency management story has always been in flux. First there was easy_install, then it was all about pip and virtualenv.

But I haven't been paying attention to the Python ecosystem over the past 5 years or so, and of course there are a few new tools in the mix: [Rye](https://rye-up.com/) and [Poetry](https://python-poetry.org/). They seem to be quite similar, and enable a workflow similar to tools like cargo, npm, etc.

## Rye

Rye is the newest of the two. It was created by Armin Ronacher (the creator of Flask) and is now maintained by [Astral](https://astral.sh/), creators of Ruff ("an extremely fast Python linter") and uv ("an extremely fast Python package installer and resolver").

### Basic usage

```bash
rye init my-project
cd my-project
rye add numpy
rye sync
```

### Running scripts

You can either run scripts via rye:

```
rye run python my_script.py
```

You can also rely on the shims:

> After installation Rye places two shims on your PATH: python and python3. These shims have specific behavior that changes depending on if they are used within a Rye managed project or outside.
>
> Inside a Rye managed project they resolve to the Python interpreter of the virtualenv. This means that even if you do not enable the virtualenv, you can just run python in a shell, and it will automatically operate in the right environment.
>
> Outside a Rye managed project it typically resolves to your system Python, though you can also opt to have it resolve to a Rye managed Python installation for you.

To enable the shims, I added the following to .zprofile:

```
source "$HOME/.rye/env"
```

### Non-package mode

To use Rye in "non-package" mode — i.e. only for managing dependencies, and not for publishing a package — you can add the following to pyproject.toml:

```
[tool.rye]
virtual = true
```

I haven't done a whole lot with Rye yet, but so far my experiences have been positive. And it's certainly fast!

## Poetry

Poetry is a bit more established than Rye, having been around since 2018.

### Basic usage

Basic usage is almost identical to Rye:

```bash
poetry new my-project
cd my-project
poetry add numpy
poetry install
```

### Running scripts

```
poetry run python ./my_script.py
```

Or you can activate the virtual environment in a subshell:

```
poetry shell
```

### Non-package mode

```
[tool.poetry]
package-mode = false
```
