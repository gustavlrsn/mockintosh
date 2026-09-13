---
name: classic-mac-icons
description: >-
  Search native 1-bit classic Mac icons (ICN#, ics#, SICN) from the ryOS
  System 7 / Mac OS 8 catalogs and import a pick as a TypeScript sprite. Use
  when the user wants icons, sprites, or artwork for dialogs, apps, folders,
  alerts, chrome, or any Mockintosh UI.
---

# Classic Mac icons

Pinned catalog of native 1-bit resources from [ryos](https://github.com/ryokun6/ryos) (`system-7` + `mac-os-8`). Color types (`icl8`, `ics8`, `cicn`) are excluded. Search is a script; picking is human; import writes `defineSprite` into `src/os/sprites/icons.ts`.

## Workflow

1. Expand the request into query terms (see [Intents](#intents)).
2. Run `npm run icons:find -- <terms>`.
3. **Read every `*.1bit.png`** from the printed preview dir. Present the numbered list. Stop.
4. After the user picks a number or path, run `npm run icons:import -- "<era/path.png>" --key icon/<slug>`.
5. Use the printed key: `<image src="icon/slug">` or `os.sprites.get("icon/slug")`.

Completion: the user has seen 1-bit previews and either picked one (imported) or rejected the set.

## Rules

- Run the scripts. Do not invent pixels when a catalog hit exists.
- Stop after find. Import only after an explicit pick (number, path, or "none").
- Keep pixels as TypeScript. Do not add files under `public/`.
- Use the published `ICN#` / `ics#` / `SICN` PNG as-is. Do not dither color icons.

## Commands

```bash
npm run icons:find -- trash folder document
npm run icons:find -- application --category system --limit 6
npm run icons:import -- "system-7/system/system-trash-system.png" --key icon/trash
npm run icons:refresh-catalog
npm run icons:gallery
```

`icons:gallery` serves every pinned icon at http://127.0.0.1:8766/.

`--json` on find is for parsing; still Read the `*.1bit.png` paths so the user can see them.

## Intents

Add these terms to the query (do not replace the user's words):

| Ask | Extra terms |
| --- | --- |
| trash | trash |
| folder / disk / volume | folder disk ram |
| document / file | document stationer edition |
| app icon | application |
| control panel | control panel |
| alias / shortcut | alias |
| help / balloon | balloon help |
| clipboard | clipboard |

## After import

The new const lives in `src/os/sprites/icons.ts` with a `ryos:` provenance comment. Built-ins register through `registerBuiltinSprites`.
