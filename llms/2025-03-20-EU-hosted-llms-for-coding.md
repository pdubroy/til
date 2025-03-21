# EU-hosted LLMs for coding

When it comes to AI, I'm neither a "believer" nor a "hater". I have a lot of concerns about generative AI _in general_, but I do find LLMs quite useful for coding.

Up to now, I've been using Claude and Copilot in Zed, and for the past few weeks, Claude Code. But I recently canceled my Claude subscription and went shopping for EU-based alternatives.

## [Mistral](https://mistral.ai/)

Mistral's [Le Chat](https://mistral.ai/products/le-chat) is pretty much a drop-in replacement for Claude. It's been handy for quick, one-off questions. It's quite fast, which is nice, but the model doesn't seem to be quite as good as even Claude 3.5 Sonnet.

Zed supports Mistral out of the box:

- Open the assistant panel (⌘-?)
- Click on ⋮ -> Configure
- Enter your API key under "Mistral"

For the chat ("Assistant Panel") and inline assistant (Ctrl-Enter), I think you want to use `mistral-large-latest`. AFAIK there's no easy way (yet) to use [Codestral](https://mistral.ai/news/codestral-2501) as an edit prediction provider.

## Aider with DeepSeek V3 & R1 on [Nebius](https://nebius.com/)

I've been using [Aider](https://aider.chat/) as a replacement for Claude Code.

Nebius is a Dutch company (although they're listed on Nasdaq?) and they offer an API for DeepSeek V3 and R1 (supposedly comparable to OpenAI's 4o and o1, respectively) via their [AI Studio](https://nebius.com/ai-studio) offering.

I was able to use these models with Aider by setting the following environment variables:

```
set OPENAI_API_BASE="https://api.studio.nebius.com/v1/"
set OPENAI_API_KEY="abcdefg123456" # <- Use your actual Nebius API key here
```

and then running Aider with:

```
aider --model openai/deepseek-ai/DeepSeek-V3
```
or
```
aider --model openai/deepseek-ai/DeepSeek-R1
```
