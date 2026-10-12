import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

test("the Media Wallet screens come from @medialane/ui, not a local copy", () => {
  expect(existsSync(join(import.meta.dir, "components", "media-wallet"))).toBe(false);
});
