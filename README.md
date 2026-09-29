# ANGEOLOGY

> *soft hearts, sharp edges.*

**ANGEOLOGY** is a concept website for a fictional makeup house: **100% vegan, cruelty free cosmetics for fallen angels**. Never tested on animals — not by the brand, not by its suppliers, not anywhere.

The site mixes two moods that shouldn't get along: **coquette** (satin bows, pearls, polka dots, blush pink) and **alternative** (fallen angels, safety pins, blackletter, eyeliner). Every page is written in the brand's voice — diaries, love letters, tarot cards, magazine issues — and every interaction is built to feel like a small, handmade object rather than a standard shop template.

Personal portfolio project · concept, design & code by **ghostly.grl** ♥

---

## Pages

| Page | File | What's inside |
|---|---|---|
| **Home** | `index.html` | The manifesto, a love‑letter product launch, **the vow** with animated counters and a stamp, a halo **orbit** of bestsellers, shades cascading in, **tarot cards** dealt from one deck, a **sweet / sour** comparison slider, portraits and a letters sign‑up. |
| **Shop** | `shop.html` | Sixteen vegan formulas. **Tap a shade and the product photo recolours** to match it. Category index, animated **filter & sort**, quick view, and products that **fly into the bag**. |
| **Collections** | `collections.html` | Four collections read like **tarot cards** (The Fallen, the bride, the doll, the bunny) — a fanned deck, chapters, a ritual list, and a three‑question **"Which angel are you?" quiz** that reveals your card. |
| **Lookbook** | `lookbook.html` | Issue n° 01, SS26: a magazine cover, an editorial grid of 12 looks with filter chips, **shop the look** (add every product she's wearing in one tap), and a **contact sheet** circled by hand. |
| **Cruelty free** | `cruelty-free.html` | The vow as a seven‑article charter, the animal ingredients that were swapped out, an **ingredient checker**, the process, and a pledge you can **sign** (kept on your device). |
| **Our story** | `about.html` | A diary kept since the very first gloss: a timeline of dated entries, a letter, values, the team and the studio, with a **string of pearls** that unrolls as you scroll. |
| **Search** | `search.html` | Search products, collections, looks and pages — including **by colour** ("pink gloss") and by price, and it answers animal‑ingredient questions straight away ("beeswax?"). |
| **Angel club** | `account.html` | Join with just a name: a **holographic member card** that previews live as you type and tilts with the pointer, plus wishlist, bag, vow and shade profile. |
| **Bag** | `cart.html` | A tray of products, a **receipt‑style order summary**, satin gift wrap, demo promo codes and recommendations. |
| **Contact** | `contact.html` | Write a **letter** to the brand; it folds itself, and the envelope flies off. |
| **FAQ** | `faq.html` | *Pillow talk*: an interview issue with eighteen questions "asked after midnight", searchable, with a table of contents. |
| **Shipping** | `shipping.html` | *The pink pages*: a phone‑directory of destinations with rates and delivery times. |
| **Privacy · Terms** | `privacy.html` · `terms.html` | Numbered legal pages; the privacy page lists **exactly what this device remembers**. |

---

## Details

- **Recolouring product photos** — one photo per product; every shade is a hue / saturation / lightness shift computed from its base colour, so a single image can show all of them.
- **A bag that follows you** — the bag, wishlist, club card and signed vow live in `localStorage`, and the bag count updates in the nav on every page.
- **Shared motion language** — satin ribbon text that speeds up when you scroll, falling (faux ♡) feathers, pearl loaders, a gliding heart in the nav, dictionary‑style definitions split into words, hand‑drawn circles.
- **Deep links** — `shop.html?p=<id>` opens a product, `lookbook.html#look-5` opens a look, `shop.html#<collection>` filters a collection.
- **Performance‑aware** — animation loops only run while their element is on screen, and reveals have a failsafe so nothing stays hidden if frames are throttled.
- **Accessible where it matters** — keyboard‑navigable radio groups, reduced‑motion support, real text instead of text‑in‑images.

---

## Design

**Palette** — paper `#fffaf7`, cream `#fff7ec`, almond `#f5eadc`, petal `#ffd7db`, blush `#f5cbd7`, lilac `#e8ccd8`, rose `#e18498`, rose ink `#a94c64`, espresso `#402e2a`, graphite `#6c6c6a`, noir `#070d0d`.

**Type** — Instrument Serif (editorial), Montserrat (UI), Imperial Script & Pinyon Script (handwriting), UnifrakturMaguntia (blackletter, for the fallen side).

**Logo** — a silver baroque cartouche drawn in SVG, filled with pink polka dots.

The original moodboard and layout references are in `VIBES/` and `LAYOUT/`.

---

## Built with

- Plain **HTML, CSS and JavaScript** — no framework, no build step
- [GSAP 3](https://gsap.com/) + ScrollTrigger + Flip
- Google Fonts

---

## Structure

```
index.html · shop.html · collections.html · lookbook.html · cruelty-free.html
about.html · search.html · account.html · cart.html · contact.html
faq.html · shipping.html · privacy.html · terms.html

css/style.css        shared styles (nav, footer, ribbon, slots, reveals)
css/<page>.css       one per page
js/main.js           shared: image slots, nav, bag, feathers, ribbon, recolouring, reveals
js/products.js       the catalogue: products, shades, collections, looks
js/<page>.js         one per page

img/                 product, campaign and editorial photos
VIBES/ · LAYOUT/     moodboard and layout references
```

---

## Run it locally

You can open `index.html` directly, but a local server is recommended so every page reliably shares the bag and the other things kept on the device:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

---

## Notes

- **Checkout is not connected** to a payment provider: the bag, promo codes and shipping rates are a working preview. Promo codes are demo values (see `js/cart.js`).
- **Nothing is sent anywhere.** Forms (letters, club sign‑up, vow) only store data in the visitor's own browser; the privacy page lists every key.

<sub>ANGEOLOGY is a fictional brand. Photos belong to their respective owners and are used here as a personal, non‑commercial moodboard.</sub>

```
   *    /\_/\      +
       ( o.o )   <3  ghostly.grl
   +    > ^ <          *
```
