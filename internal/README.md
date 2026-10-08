# Focus Insite, internal team console

Desktop console for the Focus Insite team. Its own Vite project, beside `client/`;
nothing is shared with the respondent app or the client app at runtime.

```
cd internal
npm install
npm run dev        # http://localhost:5175
npm run build
npm run shot -- dashboard out.png --full     # render a route at 1440 in headless Chromium
npm run diff -- figma.png out.png            # % of differing pixels against the frame
```

`CLAUDE.md` holds the rules, the map of the Figma file and the build order.
