# Lamp Login

An interactive animated login page with a desk lamp. Pull the cord and the
room lights up — only then does the login card appear. Click the lamp shade
to change the colour of the light, and the whole form changes with it.

## How to open it

No build step, no install. Just open `index.html` in a browser (double-click
it, or serve the folder with any static server). The only network request is
GSAP from a CDN for the animations — if that fails, the page still works and
just switches states instantly.

## What it does

- **Pull the cord** — click the cord handle, or drag it down and let go, and
  the lamp turns on or off. The shade tilts, the bulb glows, a cone of light
  falls on the floor, and the login card slides in. A soft hum plays
  (Web Audio API, sine wave at 120 Hz).
- **Click the shade** — cycles the light through warm yellow, pink, and cool
  white. The wall glow, the light cone, the bulb, and the form's accent
  colour (eyebrow, tab underline, button, focus rings) all change together.
- **Sign In / Sign Up tabs** — switch the form between the two modes.
- **Show/hide password** — the eye button in the password field.
- **Demo only** — there is no backend. Submitting the form shows a small
  note that says so; it never pretends to log anyone in.
- **Reduced motion** — if the system asks for it, the GSAP flourishes are
  skipped and states just switch.
- **Phone sized** — the lamp sits above the card instead of beside it.

## Files

- `index.html` — the page, with the lamp drawn as inline SVG.
- `style.css` — the dark room, the card, and the one `--accent` variable
  that carries the light colour everywhere.
- `script.js` — plain JavaScript: the cord drag, the shade, the hum, the
  tabs, and the form.

Inspired by the "JavaScript Animation" reel of a lamp login page.
