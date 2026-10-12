import { test, expect } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = import.meta.dir;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    if (!/\.(ts|tsx)$/.test(entry) || entry.includes(".test.")) return [];
    return [full];
  });
}

test("every Media Wallet transaction runs backend intents and no fee call is built in the browser", () => {
  const offenders = sourceFiles(SRC).flatMap((file) => {
    const source = readFileSync(file, "utf8");
    const found: string[] = [];
    if (source.includes("buildFeeCall")) found.push(`${file.replace(SRC, "src")}: buildFeeCall`);
    source.split("\n").forEach((line, i) => {
      if (/signer\.execute\(/.test(line) && !/intentIds/.test(line)) found.push(`${file.replace(SRC, "src")}:${i + 1}: execute without intent ids`);
    });
    return found;
  });
  expect(offenders).toEqual([]);
});
