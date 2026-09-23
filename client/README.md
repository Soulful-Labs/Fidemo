# Focus Insite, client app

Desktop app for research clients. Its own Vite project; nothing is shared with the
respondent app in the repo root at runtime.

```
cd client
npm install
npm run dev        # http://localhost:5174
npm run build
npm run shot -- kitchen-sink out.png --full   # render a route at 1440 in headless Chromium
```

`CLAUDE.md` holds the route map with Figma node ids, the rule for how Manage and
Create are built, and the build order.
