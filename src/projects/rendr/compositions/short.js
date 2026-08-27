import short169 from "./short.16x9.rendr.json";
import short11 from "./short.1x1.rendr.json";
import short916 from "./short.9x16.rendr.json";

import hookUrl from "../assets/broll-hook.mp4";
import cutawayUrl from "../assets/broll-cutaway.mp4";
import skyUrl from "../assets/insert-photo.jpg";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  The short — three authored cuts, loaded from three real files.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The compositions are `.rendr.json` files sitting next to this one. They are not
 * generated at runtime and nothing here writes to them: this module loads them,
 * points their asset filenames at the real bundled URLs, and hands them over. The
 * engine then receives exactly what is in the file.
 *
 * ── Why three files ────────────────────────────────────────────────────────
 *
 * Every placement in the format is an absolute pixel coordinate in an authoring
 * space that is always 1280 wide, with the height falling out of the output ratio
 * (16:9 → 720, 1:1 → 1280, 9:16 → 2276). Nothing reflows. So a second aspect ratio
 * is not a setting, it is a second layout — the same as in any editing tool. Each
 * file is one cut of the same 16-second piece: same edit, same words, same
 * timings, restaged.
 *
 * ── Why the filenames get rewritten ────────────────────────────────────────
 *
 * The files say what they mean — `"src": "broll-hook.mp4"` — because that is what
 * a composition on disk looks like, and it is what the reader sees in the file
 * panel. The bundler, meanwhile, content-hashes assets (`broll-hook-C4t238AC.mp4`)
 * and is the only thing that knows the final URL. So the filename in the file is
 * the join key, and `MEDIA` below is the only place the two are tied together.
 * Add an asset to a composition and it needs a line here too, or the engine will
 * ask the dev server for a path that only exists at authoring time.
 */
const MEDIA = {
  "broll-hook.mp4": hookUrl,
  "broll-cutaway.mp4": cutawayUrl,
  "insert-photo.jpg": skyUrl,
};

/**
 * One composition, with its asset sources resolved.
 *
 * Copied rather than patched: a JSON import is a module singleton, so writing
 * into it would edit every later reader's copy of the file — including the
 * "reset to the file as authored" path, which would then reset to whatever the
 * last edit left behind.
 */
function resolveAssets(file) {
  const media = file.assets?.media || {};
  return {
    ...file,
    assets: {
      ...file.assets,
      media: Object.fromEntries(
        Object.entries(media).map(([key, asset]) => {
          const url = MEDIA[asset.src];
          if (!url && import.meta.env?.DEV) {
            console.warn(
              `[rendr] asset "${asset.src}" has no entry in MEDIA — the engine ` +
                `will fetch it as a literal path and fail.`,
            );
          }
          return [key, { ...asset, src: url || asset.src }];
        }),
      ),
    },
  };
}

/** 16 seconds at 60fps. Kept here because the transport wants it before boot. */
export const FPS = 60;
export const TOTAL_FRAMES = 960;

/**
 * Where the playhead rests before anyone presses play.
 *
 * Frame 0 — the start of the piece, so pressing play runs it from the beginning
 * rather than resuming from wherever a poster frame was chosen. It used to sit at
 * 132 to open on a nicer picture, which mattered when the engine booted on load
 * and the first thing you saw was a still. Now that it boots on a button, the
 * first frame the reader sees is the first frame of the video, which is what they
 * are about to watch.
 */
export const POSTER_FRAME = 0;

/**
 * The three authored cuts, keyed by the ratio label the demo's chips use.
 *
 * `RendrBench` swaps between these when the ratio changes, rather than only
 * rewriting `settings.resolution` — which is what it did when there was one
 * layout, and which would letterbox this one into a shape it wasn't cut for.
 */
export const SHORT_BY_RATIO = {
  "16:9": resolveAssets(short169),
  "1:1": resolveAssets(short11),
  "9:16": resolveAssets(short916),
};

/**
 * The one the bench opens on.
 *
 * Wide, not vertical — despite vertical being what the pipeline actually ships.
 * A 9:16 cut in a landscape panel is a narrow strip with letterboxing either
 * side, so the first thing a reader sees is mostly empty; and it is the tallest
 * authoring box (1280×2276), which makes it the most expensive frame to open on.
 * The vertical cut is one chip away.
 */
export const DEFAULT_RATIO = "16:9";
export const short = SHORT_BY_RATIO[DEFAULT_RATIO];

export default short;
