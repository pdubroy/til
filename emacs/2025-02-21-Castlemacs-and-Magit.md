# Castlemacs and Magit

I've never been someone to get too obsessed over my editor configuration. A long, long time ago I decided to learn Emacs, via the built-in tutorial. Since then, it's been the main editor that I used on Linux, but on macOS I've always used some kind of more modern editor (Sublime, VS Code, and now Zed).

At this point it's been at least five years since I used Emacs regularly. But I decided I need a better Git client in my daily workflow, and I've heard good things about Magit, so I decided to find a good emacs setup for macOS.

## Installing Emacs

One of the first decisions is how to install Emacs. There are a bunch of different "ports" to choose from:

- The [Emacs for Mac OS X](https://emacsformacosx.com/) binary download.
- From Homebrew:
  * `brew install emacs` (terminal-only I think?)
  * `brew install --cask emacs`
  * `brew install emacs-plus`
  * `brew install emacs-mac` (by railwaycat)

🫠

I recently heard about [Castlemacs](https://github.com/freetonik/castlemacs): "a simple, modern and minimalist Emacs setup tailored to macOS". They suggest the `emacs-mac` Homebrew formula so I went with that:

```
brew tap railwaycat/emacsmacport
brew install emacs-mac --with-natural-title-bar --with-starter --with-modules --with-emacs-big-sur-icon
```

**NOTE:** The Castlemacs README suggests `brew install emacs-mac --with-natural-title-bar` but when I tried that, and ran `emacs` in my terminal, the GUI window wouldn't take keyboard input! I think the `--with-starter` option fixes that; it installs a helper script to `/opt/homebrew/bin/emacs`.

## Setting up Castlemacs

Castlemacs is just an Emacs _configuration_, and the setup is straightforward:

```
brew install ripgrep aspell gnutls # Install dependencies
mv ~/.emacs.d ~/.emacs.d.bak
git clone https://github.com/freetonik/castlemacs ~/.emacs.d
```

If you had a pre-existing Emacs configuration, you'd want to move it into ~/.emacs.d/private.el.

So far Castlemacs seems nice! I appreciate having a config where platform-native shortcuts (like ⌘-z, ⌘-c, etc.) "just work". In the past I always found it difficult to keep two completely separate lists of shortcuts in my brain.

## Starter scripts

Starter scripts are another big rabbit hole. How do you want to launch Emacs, and what happens when you type `emacs` in the terminal?

[Railwaycat's note on Emacs start helpers](https://github.com/railwaycat/homebrew-emacsmacport/blob/master/docs/emacs-start-helpers.md) seems useful, as does [this blog post by Aidan Scannell](https://www.aidanscannell.com/post/setting-up-an-emacs-playground-on-mac/). But I just did the following:

- I put `(server start)` in my ~/.emacs.d/private.el.
- Added the following function to my fish config:
  ```
  function e
      emacsclient -n -a '' $argv; and open -a Emacs
  end
  ```

AFAIK the `open -a Emacs` is required to bring the window to the front.

## Magit

I also wanted a shortcut to launch Magit from the command line. Here's what I came up with:

```
function magit
    set -l dir $argv[1]
    if test -z "$dir"
        set dir $PWD
    end
    emacsclient -n -a '' -e "(magit-status \"$dir\")"
    open -a Emacs # Bring window to the front
end
```

I also wanted Magit to take up the full window (or _frame_ in Emacs-speak), so I added the following to my ~/.emacs.d/private.el:

```
;; Always make magit take up the full frame
(setq magit-display-buffer-function 'magit-display-buffer-fullframe-status-v1)
```
