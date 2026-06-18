# Cloud Panel — Website ☁️

A beautiful, Cloud Panel-themed **marketing + documentation** site. Zero
dependencies (a tiny Node static server), fully self-contained (no external
CDNs), and ready to publish to the internet with a **Cloudflare Tunnel**.

## Run locally

```bash
cd cloud-panel-web
npm start          # serves http://localhost:8090
```

(Plain Node — no `npm install` needed.)

## Publish with Cloudflare Tunnel

Install [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/),
then in a second terminal:

```bash
npm run tunnel
# = cloudflared tunnel --url http://localhost:8090
```

Cloudflare prints a public `https://<random>.trycloudflare.com` URL anyone can
open. For a permanent custom domain, create a **named tunnel**:

```bash
cloudflared tunnel login
cloudflared tunnel create cloud-panel
cloudflared tunnel route dns cloud-panel docs.yourdomain.com
cloudflared tunnel run --url http://localhost:8090 cloud-panel
```

## Customize

- **Discord / GitHub links:** open `public/js/main.js` and set the `SITE` object:
  ```js
  const SITE = { discord: 'https://discord.gg/your-invite', github: 'https://github.com/you/cloud-panel' };
  ```
  That updates every Discord/GitHub link site-wide. (Otherwise the placeholder
  `https://discord.gg/cloudpanel` links in the HTML are used.)
- **Content:** `public/index.html` (landing) and `public/docs.html` (docs).
- **Theme:** `public/css/style.css` — same cyan→indigo→violet tokens as the panel.

## Structure

```
server.js            Zero-dependency static server (clean URLs, 404 page)
public/
  index.html         Landing page (hero, features, eggs, bot, steps, FAQ, CTA)
  docs.html          Documentation (sidebar + scrollspy)
  404.html           Themed not-found page
  css/style.css      Design system
  js/main.js         Nav, reveal, counters, hero typing, copy, scrollspy
  img/               Logo & favicon
```

## License

MIT
