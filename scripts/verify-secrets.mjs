import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const staticDir = path.resolve(projectRoot, ".next", "static");

const FORBIDDEN_SECRET_VARIABLES = [
  "MONGODB_URI",
  "RATE_LIMIT_SALT",
  "ADMIN_PASSCODE_HASH",
  "SESSION_SECRET",
  "AWS_SECRET_ACCESS_KEY",
  "DATABASE_URL",
];

function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function verifySecrets() {
  console.log("Auditing client bundle in .next/static for leaked secrets...");

  if (!fs.existsSync(staticDir)) {
    console.warn("⚠️ .next/static does not exist. Run 'npm run build' before verifying secrets.");
    process.exit(1);
  }

  const files = getAllFiles(staticDir);
  console.log(`Scanning ${files.length} build artifact files in ${staticDir}...`);

  const leaks = [];

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch (err) {
      if (err.code === "ENOENT") continue;
      throw err;
    }
    const relativePath = path.relative(projectRoot, file);

    for (const secretVar of FORBIDDEN_SECRET_VARIABLES) {
      // Look for secret variable name in JavaScript/JSON code
      if (content.includes(secretVar)) {
        leaks.push({
          file: relativePath,
          variable: secretVar,
        });
      }
    }
  }

  if (leaks.length > 0) {
    console.error("❌ CRITICAL SECURITY VULNERABILITY: Secrets found in client build artifacts!");
    for (const leak of leaks) {
      console.error(`  - Found variable "${leak.variable}" in ${leak.file}`);
    }
    process.exit(1);
  }

  console.log(
    "✓ Client bundle audit clean: Zero secret variable names or tokens found in .next/static/"
  );
}

verifySecrets();
