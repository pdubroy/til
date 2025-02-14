# Get image dimensions at the command line

Say you have a directory with a bunch of images:

```
~/d/til (main) [0|0|1]▸ find images -name \*.png | head -3
images/corner-plot.png
images/metal-buffer-layout.png
images/instruments-choose-process.png
```

On macOS, you can use `sips -g pixelWidth -g pixelHeight` to get the dimensions:

```
~/d/til (main)▸ find images -name \*.png | head -3 | xargs sips -g pixelWidth -g pixelHeight
/Users/pdubroy/dev/til/images/corner-plot.png
  pixelWidth: 551
  pixelHeight: 900
/Users/pdubroy/dev/til/images/metal-buffer-layout.png
  pixelWidth: 1517
  pixelHeight: 926
/Users/pdubroy/dev/til/images/instruments-choose-process.png
  pixelWidth: 1072
  pixelHeight: 602
```

Very useful!

You can find more documentation on the [man page](https://ss64.com/mac/sips.html). See also Simon Willison's TIL: [sips: Scriptable image processing system](https://til.simonwillison.net/macos/sips).
