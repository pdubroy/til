# WebP is awesome

On the web site for [our book](https://wasmgroundup.com), we had a couple large screenshots, stored as PNGs. I was looking for ways to reduce the file size, so I tried running them through [ImageOptim][]. That helped somewhat, but didn't make a huge difference.

I asked Claude what to do, and it suggested WebP. My first thoughts were:

- Is it well supported in browsers other than Chrome?
- Will it make much of a difference?

Some quick research gave me the answers: yes and yes!

[caniuse](https://caniuse.com/webp) says:

> Since September 2020, this feature works across the latest devices and major browser versions.

As for the file size, I was pretty impressed. Here are a few files I tried it on:

```
376K macOS-specific-bits-wide.png
  75K macOS-specific-bits-wide.webp
 487K macOS-specific-bits.png
  83K macOS-specific-bits.webp
  92K native-binary-vs-wasm-binary.png
  44K native-binary-vs-wasm-binary.webp
 230K nodejs-downloads.png
  30K nodejs-downloads.webp
  83K og-image-large.png
  42K og-image-large.webp
```

So: 20%, 17%, 48%, 13%, 51%. Not bad!

To convert the PNGs to WebP, I used [cwebp](https://developers.google.com/speed/webp/docs/cwebp). On macOS, you can install it with `brew install cwebp`.

Here's the command line I used to convert all images in a given directory:

```sh
find . -name "*.png" -exec sh -c 'cwebp "$1" -o "${1%.png}.webp"' _ {} \;
```
