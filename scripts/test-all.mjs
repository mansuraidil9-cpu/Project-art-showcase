import { spawnSync } from "node:child_process";

const suites = ["session-token", "security", "db", "auth", "admin", "artworks", "member", "moderation", "challenges", "winners"];
for (const suite of suites) {
  console.log("\nPemeriksaan:", suite);
  const result = spawnSync(process.execPath, ["--conditions=react-server", "scripts/test-" + suite + ".mjs"], { stdio: "inherit" });
  if (result.error || result.status !== 0) {
    console.error("Pemeriksaan berhenti pada:", suite);
    process.exit(result.status || 1);
  }
}
console.log("\nLulus: seluruh pemeriksaan backend.");
