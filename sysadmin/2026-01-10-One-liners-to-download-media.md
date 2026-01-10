# One-liners for downloading media

Two little tasks I had this week, which I learned some handy one-liners for —

(And I love that these are now one-liners thanks to [uvx][]!)

[uvx]: https://docs.astral.sh/uv/guides/tools/#running-tools

## gallery-dl for downloading GIFs from Twitter

For my [Twitter archive](https://dubroy.com/twitter/), I wanted to download the original GIFs from a couple of my tweets. I used [gallery-dl][] —

```sh
uvx gallery-dl 'https://twitter.com/someuser/status/123456789'
```

[gallery-dl]: https://github.com/mikf/gallery-dl

## yt-dlp for downloading YouTube videos

Then, I wanted to watch a YouTube video ([Cpu Caches and Why You Care](https://www.youtube.com/watch?v=WDIkqP4JbkE) by Scott Meyers) and for some reason the player wouldn't let me change the speed. For that I used [yt-dlp][]:

```sh
uvx yt-dlp 'https://www.youtube.com/watch?v=WDIkqP4JbkE'
```

[yt-dlp]: https://github.com/yt-dlp/yt-dlp
