# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Theme lab — palettes and 3D materials

The site's colour and the hero's 3D material are both data, not hard-coded values.

- `src/lib/theme/palettes.ts` — ten palettes. Each one owns the CSS tokens, the
  page-grain overlay **and** the hero light rig, so the page and the 3D scene
  always move together.
- `src/lib/theme/materials.ts` — fifteen material presets for the head and the
  floating logos (metal, ceramic, glass, stone, fabric, stylised).
- `src/lib/theme/textures.ts` — the procedural canvas textures those presets
  use (grain, brushed, hammered, weave, veining, patina). No image assets.
- `src/lib/stores/themeStore.ts` — applies the active palette to `:root` and
  keeps the selection in the URL and `localStorage`.

Try combinations:

```
npm run dev
# then open
http://localhost:5173/?lab=1                                  # the picker panel
http://localhost:5173/?palette=obsidian-chrome&material=liquid-chrome
```

`Shift+L` toggles the picker anywhere on the site. `?palette=` and `?material=`
override whatever is stored, so a link always shows what it promises.

To make a combination permanent: set `defaultPaletteId` / `defaultMaterialId`,
and copy that palette's values into the `:root` block in `src/app.css`.

That second step matters. The tokens are applied from JavaScript on hydration,
so a *non-default* palette (one picked in the lab or passed in the URL) paints
the default for one frame first. That is fine while exploring; once a direction
is chosen, baking it into `:root` removes the flash entirely.
