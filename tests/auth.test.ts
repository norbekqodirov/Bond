import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateTokenPair, hashToken } from "@/lib/auth/refresh";

describe("auth helpers", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Secret123!");
    const ok = await verifyPassword("Secret123!", hash);
    const fail = await verifyPassword("Wrong", hash);

    expect(ok).toBe(true);
    expect(fail).toBe(false);
  });

  it("creates refresh token hashes", () => {
    const { rawToken, tokenHash } = generateTokenPair();
    expect(rawToken.length).toBeGreaterThan(10);
    expect(tokenHash).toBe(hashToken(rawToken));
  });
});
