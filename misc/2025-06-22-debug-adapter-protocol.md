# Debug Adapter Protocol

Recently I mentioned to someone that I've been thinking about building a debugger. They asked me if I knew about the [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/). I didn't!

> The idea behind the Debug Adapter Protocol (DAP) is to abstract the way how the debugging support of development tools communicates with debuggers or runtimes into a protocol. [...] The Debug Adapter Protocol makes it possible to implement a generic debugger for a development tool that can communicate with different debuggers via _debug adapters_.

And then a few days ago I saw that [Zed (my editor of choice) now supports debugging](https://zed.dev/blog/debugger), and it's based on DAP.
