import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import { applyProductBranding } from "@/src/lib/product/branding";
import { getHomePageCopy } from "@/src/lib/product/home";
import { getProductConfig, normalizeProductId } from "@/src/lib/product/config";

test("product id normalization falls back safely and resolves Actium explicitly", () => {
  assert.equal(normalizeProductId("actium"), "actium");
  assert.equal(normalizeProductId("ACTIUM"), "actium");
  assert.equal(normalizeProductId("something-else"), "summareu");
});

test("Actium branding rewrites entity-oriented UI strings to company-oriented ones", () => {
  assert.equal(applyProductBranding("Accés entitat", "ca", "actium"), "Accés empresa");
  assert.equal(applyProductBranding("Dar de alta entidad", "es", "actium"), "Dar de alta empresa");
  assert.equal(
    applyProductBranding("La junta o patronat pot respondre ràpid.", "ca", "actium"),
    "La direcció o equip pot respondre ràpid."
  );
});

test("home page copy switches to the Actium business positioning", () => {
  const actiumHome = getHomePageCopy("ca", "actium");
  assert.equal(actiumHome.heroBadge.includes("empreses"), true);
  assert.equal(actiumHome.footerApps[0]?.label, "Actium");

  const summareu = getProductConfig("summareu");
  assert.equal(summareu.brandName, "Summa Reu");
});

test("workspace signup route aliases the legacy entity signup handler", async () => {
  const source = await fs.readFile("app/api/auth/workspace-signup/route.ts", "utf8");
  assert.equal(source.includes('export { POST, runtime } from "../entity-signup/route";'), true);
});
