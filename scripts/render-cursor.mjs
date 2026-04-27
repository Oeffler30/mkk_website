/**
 * Rasterizes `static/cursors/metal-horns.svg` to a small PNG for `cursor: url(...)`.
 * Browsers reject oversized cursor images; large SVGs (e.g. 1024×1024) fail silently.
 *
 * Renders the SVG at a high density, resamples to the cursor size (preserves geometry),
 * then sets RGB to white wherever alpha > 0 so the glyph reads on dark chrome without
 * changing the alpha silhouette (no interior flood-fill — that was merging intentional gaps).
 */
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'static', 'cursors', 'metal-horns.svg');
const dest = join(root, 'static', 'cursors', 'metal-horns-cursor.png');

/** On-screen cursor size (px); keep ≤128 for browser limits. */
const SIZE = 48;

/**
 * @param {Buffer} data
 */
function forceWhiteRgbWhereVisible(data) {
	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] > 0) {
			data[i] = 255;
			data[i + 1] = 255;
			data[i + 2] = 255;
		}
	}
}

await mkdir(dirname(dest), { recursive: true });

const svgBuf = await readFile(src);

const { data, info } = await sharp(svgBuf, {
	limitInputPixels: false,
	/** Sharper downscale from large viewBox (e.g. 1024) to tiny cursor. */
	density: 360
})
	.resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
	.ensureAlpha()
	.raw()
	.toBuffer({ resolveWithObject: true });

forceWhiteRgbWhereVisible(data);

await sharp(data, {
	raw: { width: info.width, height: info.height, channels: 4 }
})
	.png({ compressionLevel: 9 })
	.toFile(dest);

console.log(`Cursor PNG written (${SIZE}×${SIZE}): ${dest}`);
