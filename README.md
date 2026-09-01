# Dolphin InSAR Browser

A dark, analysis-first browser for exploring Dolphin displacement time series. The map is rendered with deck.gl and the interface includes acquisition playback, point inspection, a displacement chart, coherence controls, and export affordances.

## Run locally

```bash
npm install
npm run dev
```

Create a production bundle with `npm run build`.

## Dolphin Zarr input

The browser-side Zarr adapter in `src/zarr.ts` accepts an HTTP-accessible Zarr v2 or v3 array with dimensions `[time, y, x]`. It opens the store lazily and reads a single acquisition at a time, so the full Dolphin time series is never downloaded just to display one map frame.

The included interface uses a deterministic demonstration cube for immediate local preview. Connect a deployed Dolphin cube by calling `openDolphinCube(url)`, then use `readDate(index)` as the raster source. Zarr endpoints must allow cross-origin range requests when hosted on another origin.
