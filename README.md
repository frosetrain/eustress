# eustress

A real-time, multiplayer card game, using UNO cards. Built with Svelte and Python websockets.

## Running locally

### Server

In [game.svelte.ts](player/src/lib/game.svelte.ts), on line 30, change `wss` to `ws`, so that it works without HTTPS when running locally.

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

### Player

Create a `.env` file containing:

```
PUBLIC_SERVER=127.0.0.1:8765
```

Then start the server:

```bash
cd player
npm install
npm run dev
```

If the homepage says “connecting” for a very long time, try refreshing.

You can test the game by opening two windows side-by-side and playing with yourself!! :D

## Descriptive README

> because Max from high seas wants it

This game was inspired by a popular game played in schools. According to some [online sources](<https://www.wikihow.com/Play-Stress-(Card-Game)>), the game is usually played with playing cards, but in this case, UNO cards are used.

I like this card game in real life, and I feel like it is a challenge to implement it on the web. It being a real-time game, I can’t depend on the atoms being in the same position for all players in real life, so this would make it more challenging.

I designed the card deck with inspiration from the UNO Iconic 70s card deck, which has a very nice design. I copied the concentric ovals design, with each oval being a darker shade of the color. I made it in Inkscape and I included it in my project as an SVG.

The player (frontend) is written using SvelteKit, using TailwindCSS, Framer Motion, and the built-in JavaScript WebSocket API.

The server (backend) is written using the Python websockets library, and hosted on Nest.

The game is mobile responsive, and it supports drag-and-drop card movement on all platforms, using the `mobile-drag-drop` polyfill. It also has keyboard shortcuts for those **pro players**.

The biggest challenge was that this game is real-time, which means that there can be race conditions. The server just responds “no” if a player’s request becomes invalid by the time the server receives it.

I also had to standardise the WebSocket API on both sides. That was slightly challenging (although not really). I decided not to send JSON and just send space-separated values, which might have been a bad idea (although not really).
