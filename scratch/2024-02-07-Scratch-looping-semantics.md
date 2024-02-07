# Scratch's semantics

Some things I learned about the semantics of `repeat` blocks in [Scratch](https://scratch.mit.edu/).

## Delays

According to the [official Scratch wiki](https://en.scratch-wiki.info/wiki/Repeat_Until_()_(block)):

> After each iteration of the loop, a delay of 1/30 of a second (or one frame) is added before the next iteration continues. This allows for animations to be run smoother.

But, this is not quite true. If you update a variable every iteration of the loop, [you'll see the variable update instantaneously](https://twitter.com/dubroy/status/1753435097674534965).

A [discussion on the Scratch forum](https://scratch.mit.edu/discuss/topic/313368/?page=1#post-3230950) provides a helpful answer:

> If it's not a non-refresh script loop then Scratch will go through each of the currently running scripts and execute its blocks up until it reaches a ‘yield point’. Once it reaches such a point, that script will ‘yield’ (stop executing) and Scratch will move on to the next script and do the same thing. A yield point is either the end of a loop (forever, repeat, repeat until), or some kind of wait block (broadcast and wait, ask and wait, wait N secs, wait until), or the end of the script.
>
> While Scratch is going through those currently running scripts, it keeps a note of when one of them executed a block that can (potentially) change something on-screen. This includes such things as motion blocks (e.g: move N steps), looks blocks (e.g. switch costume), pen down, etc. It will often count as a change even if nothing actually changed (e.g. if the costume switched to the costume it's already on, or if it moved to the position it already has) – although it does take into account if the sprite is hidden and the pen is not down (the change won't be seen, so it doesn't register as a change).
>
> If it did NOT execute such a block, OR if it is in turbo mode, then Scratch will NOT (usually) wait for the next screen refresh, but will go straight back to executing another pass through all running scripts. That is, unless it is coming up to time for the next screen refresh (i.e. it has been executing scripts like this for nearly 1/30th second since the last refresh).
>
> Conversely, if it DID execute such a block, and it's NOT in turbo mode, or if it has been nearly 1/30th sec since the last refresh, then Scratch will commit all pen drawing to the pen canvas (which can take some time if there has been a lot of drawing), and wait for the next screen refresh.

## Interleaving

What about interleaving? If there are two scripts with repeat blocks, and one of them causes a redraw and the other doesn't, what happens?

![][images/scratch-interleaving.png]

The setup is as follows:

- Two scripts with the same trigger.
- Script #1 contains a repeat that, reads a variable, and does something that causes redraw.
- Script #2 contains a repeat that *doesn't* cause redraw, but updates the variable.

At the end, the `vals` list contains the values 1 through 10. This seems to indicate that both scripts yield between each iteration of the repeat block.

Naively, I would have expected Script #2 to complete in a single frame, since it doesn't cause a redraw.
