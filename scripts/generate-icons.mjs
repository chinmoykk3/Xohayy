import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, "../public/icons");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Creates the SVG for standard icons (with transparent background, lifebuoy motif).
 */
function createStandardIconSvg(size) {
  // SVG viewBox 0 0 512 512
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <radialGradient id="ringGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="70%" stop-color="#b91c1c" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </radialGradient>
    <radialGradient id="waterGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Drop Shadow Layer -->
  <g filter="url(#shadow)">
    <!-- Main Lifebuoy Outer Body -->
    <path d="M 256 32 A 224 224 0 1 0 256 480 A 224 224 0 1 0 256 32 Z M 256 144 A 112 112 0 1 1 256 368 A 112 112 0 1 1 256 144 Z"
          fill="url(#ringGrad)" fill-rule="evenodd" />
  </g>

  <!-- White Reflector Strips (4 bands at top, bottom, left, right) -->
  <!-- Top Band -->
  <path d="M 224 34 A 224 224 0 0 1 288 34 L 272 145 A 112 112 0 0 0 240 145 Z" fill="#ffffff" />
  <!-- Bottom Band -->
  <path d="M 224 478 A 224 224 0 0 0 288 478 L 272 367 A 112 112 0 0 1 240 367 Z" fill="#ffffff" />
  <!-- Left Band -->
  <path d="M 34 224 A 224 224 0 0 0 34 288 L 145 272 A 112 112 0 0 1 145 240 Z" fill="#ffffff" />
  <!-- Right Band -->
  <path d="M 478 224 A 224 224 0 0 1 478 288 L 367 272 A 112 112 0 0 0 367 240 Z" fill="#ffffff" />

  <!-- Lifebuoy Inner Hole (Water Background) -->
  <circle cx="256" cy="256" r="106" fill="url(#waterGrad)" />

  <!-- Calming Water Waves in Center -->
  <path d="M 196 244 Q 226 230 256 244 T 316 244" fill="none" stroke="#e0f2fe" stroke-width="8" stroke-linecap="round" />
  <path d="M 186 268 Q 221 254 256 268 T 326 268" fill="none" stroke="#bae6fd" stroke-width="8" stroke-linecap="round" />

  <!-- Outer Grab Rope and Fasteners -->
  <!-- 4 Rope Loops -->
  <path d="M 288 38 C 390 60 452 122 474 224" fill="none" stroke="#fef3c7" stroke-width="10" stroke-linecap="round" />
  <path d="M 474 288 C 452 390 390 452 288 474" fill="none" stroke="#fef3c7" stroke-width="10" stroke-linecap="round" />
  <path d="M 224 474 C 122 452 60 390 38 288" fill="none" stroke="#fef3c7" stroke-width="10" stroke-linecap="round" />
  <path d="M 38 224 C 60 122 122 60 224 38" fill="none" stroke="#fef3c7" stroke-width="10" stroke-linecap="round" />

  <!-- 4 Rope Fastener Straps -->
  <rect x="238" y="24" width="36" height="22" rx="4" fill="#0f172a" />
  <rect x="238" y="466" width="36" height="22" rx="4" fill="#0f172a" />
  <rect x="24" y="238" width="22" height="36" rx="4" fill="#0f172a" />
  <rect x="466" y="238" width="22" height="36" rx="4" fill="#0f172a" />
</svg>`;
}

/**
 * Creates the SVG for maskable icon with solid bleed background and motif inside 80% safe zone.
 */
function createMaskableIconSvg(size) {
  // SVG viewBox 0 0 512 512
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <radialGradient id="mRingGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="70%" stop-color="#b91c1c" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </radialGradient>
    <radialGradient id="mWaterGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </radialGradient>
    <filter id="mShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Full Bleed Solid Background using Design Token color -->
  <rect width="512" height="512" fill="#0369a1" />

  <!-- Lifebuoy Motif Group Scaled and Centered in Safe Area (Scale 0.76) -->
  <g transform="translate(61.44, 61.44) scale(0.76)">
    <!-- Drop Shadow Layer -->
    <g filter="url(#mShadow)">
      <!-- Main Lifebuoy Outer Body -->
      <path d="M 256 32 A 224 224 0 1 0 256 480 A 224 224 0 1 0 256 32 Z M 256 144 A 112 112 0 1 1 256 368 A 112 112 0 1 1 256 144 Z"
            fill="url(#mRingGrad)" fill-rule="evenodd" />
    </g>

    <!-- White Reflector Strips -->
    <path d="M 224 34 A 224 224 0 0 1 288 34 L 272 145 A 112 112 0 0 0 240 145 Z" fill="#ffffff" />
    <path d="M 224 478 A 224 224 0 0 0 288 478 L 272 367 A 112 112 0 0 1 240 367 Z" fill="#ffffff" />
    <path d="M 34 224 A 224 224 0 0 0 34 288 L 145 272 A 112 112 0 0 1 145 240 Z" fill="#ffffff" />
    <path d="M 478 224 A 224 224 0 0 1 478 288 L 367 272 A 112 112 0 0 0 367 240 Z" fill="#ffffff" />

    <!-- Center Hole -->
    <circle cx="256" cy="256" r="106" fill="url(#mWaterGrad)" />

    <!-- Waves -->
    <path d="M 196 244 Q 226 230 256 244 T 316 244" fill="none" stroke="#e0f2fe" stroke-width="8" stroke-linecap="round" />
    <path d="M 186 268 Q 221 254 256 268 T 326 268" fill="none" stroke="#bae6fd" stroke-width="8" stroke-linecap="round" />

    <!-- Grab Ropes -->
    <path d="M 288 38 C 390 60 452 122 474 224" fill="none" stroke="#fef3c7" stroke-width="10" stroke-linecap="round" />
    <path d="M 474 288 C 452 390 390 452 288 474" fill="none" stroke="#fef3c7" stroke-width="10" stroke-linecap="round" />
    <path d="M 224 474 C 122 452 60 390 38 288" fill="none" stroke="#fef3c7" stroke-width="10" stroke-linecap="round" />
    <path d="M 38 224 C 60 122 122 60 224 38" fill="none" stroke="#fef3c7" stroke-width="10" stroke-linecap="round" />

    <!-- Fasteners -->
    <rect x="238" y="24" width="36" height="22" rx="4" fill="#0f172a" />
    <rect x="238" y="466" width="36" height="22" rx="4" fill="#0f172a" />
    <rect x="24" y="238" width="22" height="36" rx="4" fill="#0f172a" />
    <rect x="466" y="238" width="22" height="36" rx="4" fill="#0f172a" />
  </g>
</svg>`;
}

async function main() {
  console.log("Generating PWA icons...");

  // Save base SVGs
  const standardSvg512 = createStandardIconSvg(512);
  const maskableSvg512 = createMaskableIconSvg(512);

  fs.writeFileSync(path.join(outputDir, "icon.svg"), standardSvg512, "utf8");
  fs.writeFileSync(path.join(outputDir, "icon-maskable.svg"), maskableSvg512, "utf8");

  // Generate 192x192 PNG
  await sharp(Buffer.from(standardSvg512))
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, "icon-192.png"));
  console.log("✓ Generated icon-192.png");

  // Generate 512x512 PNG
  await sharp(Buffer.from(standardSvg512))
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, "icon-512.png"));
  console.log("✓ Generated icon-512.png");

  // Generate 512x512 Maskable PNG
  await sharp(Buffer.from(maskableSvg512))
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, "icon-maskable-512.png"));
  console.log("✓ Generated icon-maskable-512.png");

  console.log("All icons generated successfully!");
}

main().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
