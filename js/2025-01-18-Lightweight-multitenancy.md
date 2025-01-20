# Lightweight multitenancy for server-side JS

Cloudflare, in [Cloud Computing without Containers](https://blog.cloudflare.com/cloud-computing-without-containers/) (2018):

> Cloudflare has a cloud computing platform called Workers. Unlike essentially every other cloud computing platform I know of, it doesn’t use containers or virtual machines. We believe that is the future of Serverless and cloud computing in general.

This week I had two conversations with teams exploring a deployment model like this. I decided to do a bit of research to understand this model better: what the pros and cons are, and how you can do something like this if you're _not_ Cloudflare.

## What are isolates?

From the Cloudflare post:

> Isolates are lightweight contexts that group variables with the code allowed to mutate them. Most importantly, a single process can run hundreds or thousands of Isolates, seamlessly switching between them. They make it possible to run untrusted code from many different customers within a single operating system process. They’re designed to start very quickly…and to not allow one Isolate to access the memory of another.

The V8 docs on [Getting started with embedding V8](https://v8.dev/docs/embed) is also a good resource.

## Who else is doing this?

### Deno Deploy

From [The Anatomy of an Isolate Cloud](https://deno.com/blog/anatomy-isolate-cloud) (2022):

> Designing Deno Deploy was an opportunity to re-imagine how we want the developer experience of deploying an app to be, and we wanted to focus on speed and security. Instead of deploying VMs or containers, we decided on V8 isolates, which allows us to securely run untrusted code with significantly less overhead.

However, unlike Cloudflare, Deno uses a **process per isolate**, using namespaces and cgroups for additional isolation. [How security and tenant isolation allows Deno Subhosting to run untrusted code securely](https://deno.com/blog/subhosting-security-run-untrusted-code) has more details. _h/t [@macwright.com](https://bsky.app/profile/macwright.com)_

Deno Deploy powers [Netlify serverless functions](https://docs.netlify.com/functions/overview/).

### Supabase

[Supabase Edge Functions](https://supabase.com/edge-functions) used to be on Deno Deploy, but [according to Supabase's CEO](https://news.ycombinator.com/item?id=38623676):

> We self-host the Edge Runtime now: https://github.com/supabase/edge-runtime

The blog post [Supabase Edge Runtime: Self-hosted Deno Functions](https://supabase.com/blog/edge-runtime-self-hosted-deno-functions) gives some more details:

> User Workers are separate JS contexts (V8 isolates) that can run a given Edge Function. They have a restricted API (for example, they don’t get access to the host machine’s environment variables). You can also control the memory and duration a User Worker can run.

So it sounds like they are running multiple isolates per process, like Cloudflare.

### Vercel

[Vercel Edge Runtime](https://vercel.com/docs/functions/runtimes/edge-runtime) is supposedly hosted on Cloudflare ([source](https://news.ycombinator.com/item?id=42080178)).

## Security considerations

There's a great [HN discussion](https://news.ycombinator.com/item?id=31759170) between Kurt Mackey (CEO of [Fly.io](https://news.ycombinator.com/item?id=31740885)), Kenton Varda (Tech lead for Cloudflare Workers), and tptacek (a well-known HN user and security researcher who works at Fly.io). Some highlights:

- mkurt:
  > The downside of v8 isolates is: you have to reinvent a whole bunch of stuff to get good isolation (both security and of resources).
  Here's an example. Under no circumstances should CloudFlare or anyone else be running multiple isolates in the same OS process. They need to be sandboxed in isolated processes. Chrome sandboxes them in isolated processes.
  >
  > Process isolation is slightly heavier weight (though forking is wicked fast) but more secure. Processes give you the advantage of using cgroups to restrict resources, namespaces to limit network access, etc.
  >
  > My understanding is that this is exactly what Deno Deploy does (https://deno.com/deploy).
  >
  > Once you've forked a process, though, you're not far off from just running something like Firecracker. This is both true and intense bias on my part. I work on https://fly.io, we use Firecracker. We started with v8 and decided it was wrong. So obviously I would be saying this.
- kentonv:
  > The future of compute is fine-grained. Cloudflare Workers is all about fine-grained compute, that is, splitting compute into small chunks -- a single HTTP request, rather than a single server instance. This is what allows us to run every customer's code (no matter how little traffic they get) in hundreds of locations around the world, at a price accessible to everyone.
  >
  > The finer-grained your compute gets, the higher the overhead of strict process isolation gets. At the point Cloudflare is operating at, we've measured that imposing strict process isolation would mean an order of magnitude more overhead, in terms of CPU and memory usage. It depends a bit on the workload of course, but it's big. Yes, this is with all the tricks, zygote processes, etc.

Some more details about the Cloudflare Workers architecture can be found in the post [Mitigating Spectre and Other Security Threats: The Cloudflare Workers Security Model](https://blog.cloudflare.com/mitigating-spectre-and-other-security-threats-the-cloudflare-workers-security-model/).

## Can we do this ourselves?

The [Supabase Edge Runtime](https://github.com/supabase/edge-runtime) is one option.

Another option would be the [isolated-vm](https://www.npmjs.com/package/isolated-vm) NPM package:

> `isolated-vm` is a library for nodejs which gives you access to v8's `Isolate` interface. This allows you to create JavaScript environments which are completely isolated from each other.

But, they give the following caveats:

> 1. Multi-process architecture. v8 is not resilient to out of memory conditions and is unable to gracefully unwind from these errors. Therefore it is possible, and even common, to crash a process with poorly-written or hostile software. I implemented a band-aid for this with the onCatastrophicError callback which quarantines a corrupted isolate, but it is not reliable.
>
> 2. Bundled v8 version. nodejs uses a patched version of v8 which makes development of this module more difficult than it needs to be. For some reason they're also allowed to change the v8 ABI in semver minor releases as well, which causes issues for users while upgrading nodejs. Also, some Linux distributions strip "internal" symbols from their nodejs binaries which makes usage of this module impossible. I think the way to go is to compile and link against our own version of v8.

## What about WebAssembly?

WebAssembly offers a model that's conceptually similar to isolates. You can have multiple Wasm modules in the same process, and the runtime ensures that they are isolated from each other.

Fastly apparently does this in their Compute@Edge platform, [according to Pat Hickey](https://news.ycombinator.com/item?id=32744291) (Principal Engineer at Fastly):

> The security properties are ultimately why we invested in WebAssembly. We (Fastly; the author is my colleague) run very large numbers of WebAssembly modules, all in the same process where the plaintext HTTP requests and responses from very large numbers of our customers reside, without needing to trust the authors of those modules.

More about Fastly's approach:
- The WebAssembly runtime they use is [Wasmtime](https://wasmtime.dev/).
- For JavaScript code, [they use SpiderMonkey.wasm](https://news.ycombinator.com/item?id=32916019) and [weval](https://github.com/bytecodealliance/weval). More details in [a talk by Chris Fallin](https://www.youtube.com/watch?v=_T3s6-C38JI)
  > We require fully ahead-of-time compilation…in our distributed system, this is in a separate control plane. […] We do not give the user any primitives to generate new code at runtime.”
  - See also Max Bernstein's [Compilers for free with weval](https://bernsteinbear.com/blog/weval/).

You could debate whether this is more secure than isolates. From an [HN comment by tptacek](https://news.ycombinator.com/item?id=32990417):

> I'm a little fuzzy on the multitenant security promise of WebAssembly. I haven't dug deeply into it. It seems though that it can be asymptotically as secure as the host system wrapper you build around it: that is, the bugs won't be in the WebAssembly but in the bridge between WebAssembly and the host OS. This is approximately the same situation as with v8 isolates, except that we have reasons to believe that WASM has a more trustworthy and coherent design than v8 isolates, so we're not worried about things like memory corruption breaking boundaries between cotenant WASM programs running in the same process.

The main argument is that:

- The surface area of WebAssembly (both the spec and the implementations) is much smaller than JavaScript and V8.
- The WebAssembly spec was designed with formal verification in mind, and there's [a machine-verified version of the formalization and soundness proof](https://dl.acm.org/doi/10.1145/3167082), proving that:

  > no computation defined by instantiation or invocation of a valid module can "crash" or otherwise (mis)behave in ways not covered by the execution semantics given in [the WebAssembly Core Specification](https://www.w3.org/TR/wasm-core-1/).

Other notes:
- Wasmer's [WinterJS](https://github.com/wasmerio/winterjs) also uses Spidermonkey.
- Some other providers using a Wasm-based model use QuickJS ([some HN discussion](https://news.ycombinator.com/item?id=32916019))

## More resources

- Charlie Marsh has a good writeup: [Isolates, microVMs, and WebAssembly](https://notes.crmarsh.com/isolates-microvms-and-webassembly).
- [Fine-Grained Sandboxing with V8 Isolates](https://www.infoq.com/presentations/cloudflare-v8/), a 2019 talk by Kenton Varda about the Cloudflare model.
- https://wasmer.io/posts/announcing-winterjs-service-workers
- Tom MacWright's post [The first four Val Town runtimes](https://blog.val.town/blog/first-four-val-town-runtimes/)
