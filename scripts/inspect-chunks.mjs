import fs from "fs";
import zlib from "zlib";

const chunksDir = ".next/static/chunks";
const files = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".js"));

for (const file of files) {
  const buf = fs.readFileSync(`${chunksDir}/${file}`);
  const gz = zlib.gzipSync(buf);
  const content = buf.toString("utf8");
  const modules = new Set();
  const re = /"\[project\]\/([^"]+)"/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    modules.add(match[1]);
  }
  if (gz.length > 5000) {
    console.log(
      `\n=== ${file} (${(buf.length / 1024).toFixed(1)} KB raw, ${(gz.length / 1024).toFixed(1)} KB gz, ${modules.size} modules) ===`
    );
    console.log(Array.from(modules).slice(0, 15).join("\n"));
  }
}
