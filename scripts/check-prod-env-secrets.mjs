#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const envPath = path.join(root, ".env");
const appHostingPath = path.join(root, "apphosting.yaml");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseEnvKeys(source) {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=", 1)[0])
    .filter(Boolean);
}

function parseSecretKeys(source) {
  const keys = new Set();
  const secretPattern = /^\s*secret:\s*([A-Z0-9_]+)\s*$/gm;
  for (const match of source.matchAll(secretPattern)) {
    keys.add(match[1]);
  }

  return keys;
}

function main() {
  if (!fs.existsSync(envPath) || !fs.existsSync(appHostingPath)) {
    console.log("prod-env-secrets: skipped (missing .env or apphosting.yaml)");
    return;
  }

  const envKeys = parseEnvKeys(read(envPath));
  const secretKeys = parseSecretKeys(read(appHostingPath));
  const overlapping = envKeys.filter((key) => secretKeys.has(key));

  if (overlapping.length > 0) {
    console.error("prod-env-secrets: .env local conté claus que App Hosting tracta com a secrets");
    for (const key of overlapping.sort()) {
      console.error(`- ${key}`);
    }
    console.error("Trau-les de .env abans de tornar a desplegar.");
    process.exit(1);
  }

  console.log("prod-env-secrets: OK");
}

main();
