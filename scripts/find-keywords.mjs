import fs from "fs";

const content = fs.readFileSync(".next/static/chunks/0yqak7-zzxx9w.js", "utf8");
console.log("Length:", content.length);
// Check for familiar function names, variable names or exports
const keywords = [
  "leaflet",
  "zod",
  "mongodb",
  "fake-indexeddb",
  "districts",
  "shelters",
  "reports",
  "helplines",
  "guides",
  "translations",
  "lucide",
  "emergency",
  "speech",
  "audio",
];

for (const kw of keywords) {
  const count = (content.match(new RegExp(kw, "gi")) || []).length;
  console.log(`${kw}: ${count} occurrences`);
}
