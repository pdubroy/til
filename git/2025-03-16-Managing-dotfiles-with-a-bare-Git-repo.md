# Managing dotfiles with a bare Git repo

I've never had a good system for keeping my dotfiles (config files) under version control. I've tried a `dotfiles` repo with symlinks, but it never seemed all that convenient.

I recently discovered a new approach that I like: a bare Git repo and a shell alias. It comes from an [HN comment by StreakyCobra](https://news.ycombinator.com/item?id=11070797):

> I use:
  ```
  git init --bare $HOME/.myconf
  alias config='/usr/bin/git --git-dir=$HOME/.myconf/ --work-tree=$HOME'
  config config status.showUntrackedFiles no
  ```
> where my ~/.myconf directory is a git bare repository. Then any file within the home folder can be versioned with normal commands like:
  ```
  config status
  config add .vimrc
  config commit -m "Add vimrc"
  config add .config/redshift.conf
  config commit -m "Add redshift config"
  config push
  ```
> And so on…
> No extra tooling, no symlinks, files are tracked on a version control system, you can use different branches for different computers, you can replicate you configuration easily on new installation.

My setup is based on this, but with slightly different names: my alias is `cfg`, and the repo is `~/.cfg`. Here's my full setup — note that I use the [fish shell](https://fishshell.com/):

```
# https://www.atlassian.com/git/tutorials/dotfiles
function cfg
    command git --git-dir=$HOME/.cfg/ --work-tree=$HOME $argv
end

# Prevent default completions for the `cfg` command. It will
# recurse into directories and basically hang forever.
complete -e -c cfg
complete -c cfg -f
```

The nice thing is, I can easily add _anything_ under my home directory to the repo with a simple `cfg add ~/path-to-the-file`.

Who knows if I'll stick with us, but it seems nice so far.
