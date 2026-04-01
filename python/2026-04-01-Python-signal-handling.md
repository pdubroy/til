# Python signal handling

I've written signal handlers in Python many times before, but never looked deeply into the exact mechanics until today.

Here's a simple example of a `SIGINT` handler:

```python
import signal


def handler(signum, frame):
    print('Signal handler called with signal', signum)


signal.signal(signal.SIGINT, handler)
```

Some questions I had, along with the answers that I discovered:

**Q:** When does `handler` run, and how it is interleaved with whatever's happening on the main thread?

**Answer:**

> A Python signal handler does not get executed inside the low-level (C) signal handler. Instead, the low-level signal handler sets a flag which tells the virtual machine to execute the corresponding Python signal handler at a later point (for example, at the next bytecode instruction).

and

> Python signal handlers are always executed in the main Python thread of the main interpreter, even if the signal was received in another thread.

(From the doc for the [`signal` module](https://docs.python.org/3/library/signal.html))

**Q:** Isn't this kind of scary? So the main thread can be preempted at an arbitrary point to run the signal handler?

**Answer:**

Unfortunately, yes! This also means:

> **Warning:** Synchronization primitives such as `threading.Lock` should not be used within signal handlers. Doing so can lead to unexpected deadlocks.

So the restrictions are pretty similar to C — see the [signal-safety(7) man page](https://www.man7.org/linux/man-pages/man7/signal-safety.7.html).

**Q:** Ok, so what's the recommended pattern?

**A:** On option is to just assign to a global variable in the handler (`shutdown_requested = True`), and do the _actual_ handling in your main loop or whatever. But in many cases you may need some way to park/wake the code in the main loop. In C you can use the [self-pipe trick](https://cr.yp.to/docs/selfpipe.html); Python has built-in support for this with [signal.set_wakeup_fd()](https://docs.python.org/3/library/signal.html#signal.set_wakeup_fd).

## How deadlock can occur

It's interesting to look at exactly how deadlock can occur. Here's the implementation of `Event` from [`cpython/Lib/threading.py`](https://github.com/python/cpython/blob/main/Lib/threading.py):

```python
    def __init__(self):
        self._cond = Condition(Lock())
        self._flag = False
    
    # ...
    
    def wait(self, timeout=None):
        with self._cond:
            signaled = self._flag
            if not signaled:
                signaled = self._cond.wait(timeout)
            return signaled
```

So the main thread could get preempted after acquiring the lock, but before the `wait`. Then suppose the signal handler tried to use the `set()` method on `Event`. Here's how it's defined:

```python
    def set(self):
        with self._cond:
            self._flag = True
            self._cond.notify_all()
```

…so you'd have a self-deadlock when the main thread tried to acquire a lock again in the handler.
