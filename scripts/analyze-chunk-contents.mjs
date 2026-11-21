import fs from "fs";

const chunkFiles = [
  "3y705tc4v-41-.js",
  "3onkkwyty4v2n.js",
  "01t2i9pe5vz2-.js",
  "33j1_fwxp3v_3.js",
  "turbopack-2u1d16houkiyo.js",
  "0wj0noag-9_fs.js",
  "3mhzncwe560ai.js",
  "36g2949v84dse.js",
  "0saze8z8jpe-c.js",
  "0yqak7-zzxx9w.js",
  "3a8b-hj0ery7o.js",
];

for (const name of chunkFiles) {
  const full = `.next/static/chunks/${name}`;
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, "utf8");

  // Search for package names or paths
  const modules = new Set();
  // Look for any string like "[project]..." or "node_modules/..."
  const matches = content.match(/"([^"]*node_modules[^"]*)"/g) || [];
  matches.forEach((m) => modules.add(m));

  const srcMatches = content.match(/"(\[project\]\/src\/[^"]*)"/g) || [];
  srcMatches.forEach((m) => modules.add(m));

  console.log(`\n=== Chunk: ${name} (size: ${(content.length / 1024).toFixed(1)} KB) ===`);
  console.log(`Found ${modules.size} node_modules, ${srcMatches.length} src matches:`);
  console.log("Sample modules:", Array.from(modules).slice(0, 10));
  if (srcMatches.length > 0) {
    console.log("Src modules:", Array.from(new Set(srcMatches)).slice(0, 15));
  }
}
