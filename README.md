# Coffee Date ☕🤍

A tiny playful coffee-date invitation built with plain HTML, CSS and JavaScript.

## What it does

- Responsive on desktop and mobile.
- The **No** button escapes when the pointer/touch gets close.
- Cute Arabic micro-messages appear as the button escapes.
- The **Accept** button reveals a success screen.
- Optional notification endpoint can be configured without exposing SMTP credentials in the browser.

## Files

- `index.html` — markup.
- `style.css` — responsive design and animations.
- `script.js` — interaction logic and notification request.

## Email notification

Do **not** put a Gmail/SMTP password in client-side JavaScript.

Deploy a small HTTPS webhook/serverless endpoint and set:

```js
const ENDPOINT = "https://your-domain.example/api/coffee-accepted";
```

The browser sends a POST JSON payload:

```json
{
  "event": "coffee_date_accepted",
  "acceptedAt": "2026-10-04T19:30:00.000Z",
  "userAgent": "..."
}
```

Your server can then send the email using your preferred mail provider.

### Vercel/Netlify/etc.

Any serverless function or edge endpoint that accepts POST can be used. Keep the email credentials in platform environment variables, never in the frontend.

## Local preview

Open `index.html` directly for the UI, or run any static server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Personalization

This first version intentionally avoids a person's name, date, or pre-booking language. It is a playful invitation rather than a booking system.
