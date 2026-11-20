#!/usr/bin/env node
// Makes small WebP versions of every gallery screenshot (public/thumbnails/<slug>-light.png), so cards and
// folders download a few KB instead of the full PNG:
//   <slug>-card.webp    for the gallery card (desktop 640px wide, mobile 300px)
//   <slug>-sheet.webp   for the folder icon on home (240px wide)
// They're static files behind the password gate like everything else (the Next image optimizer can't fetch
// through the gate). Runs after `npm run thumbnails`; run by hand with `npm run thumbnails:optimize`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public/thumbnails");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

let saved = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith("-light.png"))) {
  const slug = file.replace(/-light\.png$/, "");
  if (only.length && !only.includes(slug)) continue;
  const src = path.join(dir, file);
  const { width = 0, height = 0 } = await sharp(src).metadata();
  const mobile = height > width;
  const outputs = [
    [`${slug}-card.webp`, mobile ? 300 : 640],
    [`${slug}-sheet.webp`, 240],
  ];
  for (const [name, w] of outputs) {
    const out = path.join(dir, name);
    // Phone screens are tall; the folder sheet only shows the top, so crop it to the top part first.
    let img = sharp(src);
    if (name.endsWith("-sheet.webp")) img = img.extract({ left: 0, top: 0, width, height: Math.min(height, Math.round(width * 0.9)) });
    await img.resize({ width: w, withoutEnlargement: true }).webp({ quality: 74, effort: 5 }).toFile(out);
  }
  const before = fs.statSync(src).size;
  const after = outputs.reduce((s, [n]) => s + fs.statSync(path.join(dir, n)).size, 0);
  saved += before;
  console.log(`  ✓ ${slug}: ${Math.round(before / 1024)} KB PNG → ${Math.round(after / 1024)} KB WebP (card + sheet)`);
}
if (!saved) console.log("No screenshots to optimise.");
