import fs from "fs";
import zlib from "zlib";
import { spawn } from "child_process";

const nextStart = spawn("npx", ["next", "start", "-p", "3334"], {
  shell: true,
  stdio: "pipe",
});

nextStart.stdout.on("data", (data) => {
  const str = data.toString();
  if (str.includes("Ready in") || str.includes("started server on")) {
    fetchPage();
  }
});

async function fetchPage() {
  try {
    const res = await fetch("http://localhost:3334/en");
    const html = await res.text();

    const scriptSrcs = new Set();
    const re = /<script[^>]+src="([^"]+)"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      scriptSrcs.add(m[1]);
    }
    const pRe = /<link[^>]+rel="preload"[^>]+href="([^"]+\.js)"/g;
    while ((m = pRe.exec(html)) !== null) {
      scriptSrcs.add(m[1]);
    }

    console.log(`\n=== Measured First-Load JS for Main Route (/en) ===`);
    let totalRaw = 0;
    let totalGzip = 0;

    for (const src of scriptSrcs) {
      const rel = src.replace(/^\/_next\//, ".next/");
      if (fs.existsSync(rel)) {
        const raw = fs.readFileSync(rel);
        const gz = zlib.gzipSync(raw);
        totalRaw += raw.length;
        totalGzip += gz.length;
        console.log(
          `- ${src}: ${(raw.length / 1024).toFixed(2)} KB raw, ${(gz.length / 1024).toFixed(2)} KB gzipped`
        );
      } else {
        console.log(`- ${src}: (FILE NOT FOUND)`);
      }
    }

    console.log(`\nTOTAL RAW: ${(totalRaw / 1024).toFixed(2)} KB`);
    console.log(`TOTAL GZIPPED: ${(totalGzip / 1024).toFixed(2)} KB`);
  } catch (e) {
    console.error("Fetch error:", e);
  } finally {
    nextStart.kill();
    process.exit(0);
  }
}
