# HTTP Range requests

Did you know that HTTP supports requests for a specific range of bytes? I didn't!

I first saw this mentioned a few weeks ago in the [Protomaps documentation](https://docs.protomaps.com), and then it came up again in [an episode of Developer Voices about DuckDB](https://www.youtube.com/watch?v=_nA3uDx1rlg).

[MDN: HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests):

> An HTTP Range request asks the server to send parts of a resource back to a client. Range requests are useful for various clients, including media players that support random access, data tools that require only part of a large file, and download managers that let users pause and resume a download.

Here's an example:

`curl https://i.imgur.com/z4d4kWk.jpg -i -H "Range: bytes=0-1023" --output -`

…which issues the following request:

```
GET /z4d4kWk.jpg HTTP/2
Host: i.imgur.com
User-Agent: curl/8.7.1
Accept: */*
Range: bytes=0-1023
```

I was kind of surprised that I hadn't heard about this before, but I felt better when I found out that [Kris](https://bsky.app/profile/krisajenkins.bsky.social) hadn't either :-)
