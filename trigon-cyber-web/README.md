# Trigon Cyber-Web

Professional company site aligned with the live deployment at [trigon-cyber-techno.netlify.app](https://trigon-cyber-techno.netlify.app/).

## Preview

**With Agentation** (visual feedback toolbar for AI agents):

```powershell
cd c:\Users\jupal\Music\trigon-cyber-terminal
npm run dev:agentation
```

Opens **http://localhost:5500** (or next free port). Click the toolbar in the bottom-right to annotate elements and copy structured feedback for Cursor.

**Plain static server** (no Agentation):

```powershell
cd trigon-cyber-web
python -m http.server 5500
```

## Includes (matches Netlify)

- CyberOS terminal hero + quick commands
- About, Services, Team (incl. COO **N G N V SatyaSai Chetan**), Projects
- **Live Cyber Defense Dashboard** (animated KPIs, threat map, gauges, event log)
- Contact form → `trigoncybertechno@gmail.com`
- Terminal popups: `founder`, `ceo`, `coo`, `partner`, `dashboard`, `contact`, `collaborate`

## Hallmark + Glass3D layer

- `css/tokens.css` — OKLCH design tokens
- `css/glass3d.css` — [Glass3D](https://glass3d.dev/) frosted panels
- `css/hallmark-glass.css` — integration + motion polish
- `js/motion.js` — team card tilt (reduced-motion safe)

Glass applied to: nav, hero badge, terminal, service/team/project cards, dashboard panels, contact form, terminal popups.

## Structure

```
trigon-cyber-web/
├── index.html
├── assets/
├── css/
│   ├── tokens.css
│   ├── glass3d.css
│   ├── hallmark-glass.css
│   ├── site.css
│   └── terminal.css
└── js/
    ├── main.js         ← terminal boot
    ├── site.js         ← scroll, counters, contact
    ├── dashboard.js    ← live dashboard engine
    ├── command-engine.js
    ├── api.js
    └── terminal.js, canvas-bg.js, navigation.js, config.js
```

## Deploy

Point Netlify (or any static host) at this folder with `index.html` as the entry.
