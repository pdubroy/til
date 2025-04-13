# Two-way sync with Unison

Usually when I want to sync things between machines (e.g., for backup) I'd use `rsync`. But, despite the name, what `rsync` does isn't really _syncing_; it's better described as one-way _mirroring_.

[Unison](https://github.com/bcpierce00/unison), otoh, is designed for proper two-way sync. I'd first heard of it years ago, but never took a close look at it since I didn't have a need for it. But now I do: I wanted to be able to sync a directory on my laptop with my Hetzner VPS, and be able to propagate changes in both directions.

## Installation

On my Mac, I installed it with Homebrew:

```
brew install unison
```

On the server:

```
sudo apt install unison
```

## Syncing

You don't have to do it this way, but a handy way to use Unison is to create a _profile_. Here's my profile (in `~/.unison/hetzner.prf`):

```
root = /Users/pdubroy/Docs
root = ssh://pdubroy@123.123.123.123//mnt/data/dav

ignore = Name .DS_Store
ignore = Name ._*
perms =  0
maxsizethreshold = 102400
```

Then I can sync via `unison hetzner`. A nice feature of Unison is that by default, it prompts you for all changes and lets you manually choose a resolution. You can use `-batch` to skip the manual resolution for non-conflicting changes, and use the `-prefer` to automatically resolve conflicts by picking a particular side. For example, I use:

```
unison hetzner -batch -prefer /Users/pdubroy/Docs
```

## Trivia

Unison was designed by Benjamin C. Pierce — yeah, _that_ Benjamin C. Pierce (of [TAPL](https://www.cis.upenn.edu/~bcpierce/tapl/) fame). And it's written in OCaml. 😎
