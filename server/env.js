import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

// Hosted environment variables take precedence; local overrides precede .env.
for (const name of [".env.local", ".env"]) {
  const path = fileURLToPath(new URL(`../${name}`, import.meta.url));
  if (existsSync(path)) loadEnvFile(path);
}
