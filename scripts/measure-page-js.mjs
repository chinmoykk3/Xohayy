import fs from "fs";
import zlib from "zlib";

// Find prerendered en.html or [locale].html
const candidatePaths = [
  ".next/server/app/en.html",
  ".next/server/app/[locale].html",
  ".next/server/app/(locale)/en.html",
];

let htmlPath = candidatePaths.find((p) => fs.existsSync(p));
if (!htmlPath) {
  const search = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${f.name}`;
      if (f.isDirectory()) {
        const found = search(full);
        if (found) return found;
      } else if (f.name === "en.html" || f.name.endsWith(".html")) {
        return full;
      }
    }
    return null;
  };
  htmlPath = search(".next/server/app");
}

console.log("HTML Path:", htmlPath);
const html = fs.readFileSync(htmlPath, "utf8");
const scriptSrcs = new Set();

const scriptRe = /<script[^>]+src="([^"]+)"/g;
let m;
while ((m = scriptRe.exec(html)) !== null) {
  scriptSrcs.add(m[1]);
}

const preloadRe = /<link[^>]+rel="preload"[^>]+href="([^"]+\.js)"/g;
while ((m = preloadRe.exec(html)) !== null) {
  scriptSrcs.add(m[1]);
}

console.log("All JS loaded on main route:");
let totalRaw = 0;
let totalGz = 0;
for (const src of scriptSrcs) {
  const relPath = src.replace(/^\/_next\//, ".next/");
  if (fs.existsSync(relPath)) {
    const raw = fs.readFileSync(relPath);
    const gz = zlib.gzipSync(raw);
    totalRaw += raw.length;
    totalGz += gz.length;
    console.log(
      `- ${src}: ${(raw.length / 1024).toFixed(2)} KB raw, ${(gz.length / 1024).toFixed(2)} KB gz`
    );
  } else {
    console.log(`- ${src}: NOT FOUND`);
  }
}

console.log(
  `TOTAL First Load JS: ${(totalRaw / 1024).toFixed(2)} KB raw, ${(totalGz / 1024).toFixed(2)} KB gz`
);
