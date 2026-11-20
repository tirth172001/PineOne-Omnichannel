#!/usr/bin/env node
// Makes small WebP versions of every gallery screenshot (public/thumbnails/<slug>-light.png), so cards and
// folders download a few KB instead of the full PNG:
//   <slug>-card.webp    for the gallery card (desktop 640px wide, mobile 300px)
//   <slug>-sheet.webp   for the folder icon on home (240px wide)
//   <slug>-low.webp     a ~2 KB low-quality card image, the middle step of progressive loading
//   lib/thumbnail-placeholders.json: a tiny blurred preview per slug, shown instantly while the WebP loads
// They're static files behind the password gate like everything else (the Next image optimizer can't fetch
// through the gate). Runs after `npm run thumbnails`; run by hand with `npm run thumbnails:optimize`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public/thumbnails");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
// Tiny blurred previews, inlined in the page so a card shows something instantly while its WebP loads.
const placeholdersFile = path.join(root, "lib/thumbnail-placeholders.json");
const placeholders = fs.existsSync(placeholdersFile) ? JSON.parse(fs.readFileSync(placeholdersFile, "utf8")) : {};

let saved = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith("-light.png"))) {
  const slug = file.replace(/-light\.png$/, "");
  if (only.length && !only.includes(slug)) continue;
  const src = path.join(dir, file);
  const { width = 0, height = 0 } = await sharp(src).metadata();
  const mobile = height > width;
  const outputs = [
    [`${slug}-card.webp`, mobile ? 300 : 640],
    // The middle step of progressive loading: a quarter of the card's width, low quality, ~2 KB.
    [`${slug}-low.webp`, mobile ? 90 : 160],
    [`${slug}-sheet.webp`, 240],
  ];
  for (const [name, w] of outputs) {
    const out = path.join(dir, name);
    // Phone screens are tall; the folder sheet only shows the top, so crop it to the top part first.
    let img = sharp(src);
    if (name.endsWith("-sheet.webp")) img = img.extract({ left: 0, top: 0, width, height: Math.min(height, Math.round(width * 0.9)) });
    await img.resize({ width: w, withoutEnlargement: true }).webp({ quality: name.endsWith("-low.webp") ? 45 : 74, effort: 5 }).toFile(out);
  }
  // ~20px wide, heavily compressed: a few hundred bytes as a data URL.
  const tiny = await sharp(src).resize({ width: mobile ? 12 : 24 }).webp({ quality: 40 }).toBuffer();
  placeholders[slug] = `data:image/webp;base64,${tiny.toString("base64")}`;
  const before = fs.statSync(src).size;
  const after = outputs.reduce((s, [n]) => s + fs.statSync(path.join(dir, n)).size, 0);
  saved += before;
  console.log(`  ✓ ${slug}: ${Math.round(before / 1024)} KB PNG → ${Math.round(after / 1024)} KB WebP (card + sheet)`);
}
if (!saved) console.log("No screenshots to optimise.");
// Drop entries for screenshots that no longer exist, then save (sorted, so diffs stay small).
for (const slug of Object.keys(placeholders)) if (!fs.existsSync(path.join(dir, `${slug}-light.png`))) delete placeholders[slug];
fs.writeFileSync(placeholdersFile, JSON.stringify(Object.fromEntries(Object.entries(placeholders).sort()), null, 2) + "\n");
