import fs from "fs";
import path from "path";
import zlib from "zlib";

const MAX_BUDGET_BYTES = 150 * 1024; // 150 KB gzipped (153,600 bytes) per NFR-02

function formatKB(bytes) {
  return (bytes / 1024).toFixed(2) + " KB";
}

function checkBundleSize() {
  console.log("==================================================");
  console.log("  Main Route First-Load JavaScript Budget Check   ");
  console.log("==================================================");

  const buildManifestPath = path.resolve(".next/build-manifest.json");
  const pageManifestPath = path.resolve(".next/server/app/[locale]/page/build-manifest.json");

  if (!fs.existsSync(buildManifestPath)) {
    console.error("❌ Error: .next/build-manifest.json not found. Run 'next build' first.");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(buildManifestPath, "utf8"));
  let pageManifest = null;
  if (fs.existsSync(pageManifestPath)) {
    pageManifest = JSON.parse(fs.readFileSync(pageManifestPath, "utf8"));
  }

  // Collect all unique chunks required for first load of /[locale]
  const chunksToMeasure = new Set();

  (manifest.rootMainFiles || []).forEach((c) => chunksToMeasure.add(c));

  if (pageManifest) {
    (pageManifest.rootMainFiles || []).forEach((c) => chunksToMeasure.add(c));
    const other = pageManifest.pagesChunkGroupBootstrapParams?.["/[locale]/page"]?.otherChunks;
    if (Array.isArray(other)) {
      other.forEach((c) => chunksToMeasure.add(c));
    }
  }

  console.log(`\nEvaluating ${chunksToMeasure.size} initial chunk(s) for /[locale]:\n`);

  let totalRawBytes = 0;
  let totalGzipBytes = 0;
  const chunkDetails = [];

  for (const chunk of chunksToMeasure) {
    const chunkPath = path.resolve(".next", chunk);
    if (!fs.existsSync(chunkPath)) {
      console.warn(`⚠️ Warning: Chunk file ${chunk} was not found on disk.`);
      continue;
    }

    const rawBuffer = fs.readFileSync(chunkPath);
    const gzBuffer = zlib.gzipSync(rawBuffer);

    totalRawBytes += rawBuffer.length;
    totalGzipBytes += gzBuffer.length;

    chunkDetails.push({
      chunk,
      raw: rawBuffer.length,
      gzip: gzBuffer.length,
    });

    console.log(
      `  • ${chunk.padEnd(46)} | Raw: ${formatKB(rawBuffer.length).padStart(9)} | Gzip: ${formatKB(gzBuffer.length).padStart(9)}`
    );
  }

  console.log("\n--------------------------------------------------");
  console.log(`Total First-Load JS Size (Raw)  : ${formatKB(totalRawBytes)}`);
  console.log(`Total First-Load JS Size (Gzip) : ${formatKB(totalGzipBytes)}`);
  console.log(`Budget Limit (NFR-02)           : ${formatKB(MAX_BUDGET_BYTES)} (150 KB)`);
  console.log("--------------------------------------------------");

  if (totalGzipBytes > MAX_BUDGET_BYTES) {
    const excess = totalGzipBytes - MAX_BUDGET_BYTES;
    console.error(
      `\n❌ FAILED: Main route first-load JS size (${formatKB(totalGzipBytes)}) exceeds the 150 KB gzipped budget by ${formatKB(excess)}!\n`
    );
    process.exit(1);
  } else {
    const remaining = MAX_BUDGET_BYTES - totalGzipBytes;
    console.log(
      `\n✅ PASSED: Main route first-load JS (${formatKB(totalGzipBytes)}) is within budget (${formatKB(remaining)} remaining headroom).\n`
    );
    process.exit(0);
  }
}

checkBundleSize();
