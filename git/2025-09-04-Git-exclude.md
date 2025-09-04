# Git exclude

Via [Marijke Luttekes](https://marijkeluttekes.dev/blog/articles/2025/09/03/git-exclude-a-handy-feature-you-might-not-know-about/):

> The exclude file is located in the .git directory, which most editors hide from you. More precisely, you will find it here:
>
> `my-repository/.git/info/exclude`

What is it useful for?

> Exclude is particularly handy when you want to keep personal, non-standard files in a repository that is not yours, and where you cannot update its ignore files willy-nilly.
>
> Some examples I have used it for:
>
> 1. Personal scripts and script files (e.g., Makefile, Justfile, Taskfile).
> 2. Temporary code and more of that random experimental stuff.
> 3. A Django management command named zzz_marijke, for when a regular Python module does not cut it.
> 4. A Docker Compose override file, before someone finally added that one to the project's main ignore file (where it belongs).
