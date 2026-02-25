import { describe, expect, it } from "vitest";

import { collectPermissions, hasPermission } from "@/lib/rbac";

describe("rbac", () => {
  it("collects permission keys", () => {
    const user = {
      roles: [
        {
          role: {
            permissions: [
              { permission: { key: "events.view" } },
              { permission: { key: "events.create" } }
            ]
          }
        }
      ]
    } as any;

    const permissions = collectPermissions(user);
    expect(permissions.has("events.view")).toBe(true);
    expect(permissions.has("events.create")).toBe(true);
  });

  it("checks permission sets", () => {
    const permissions = new Set(["events.view", "events.create"]);
    expect(hasPermission(permissions, "events.view")).toBe(true);
    expect(hasPermission(permissions, "events.delete")).toBe(false);
    expect(hasPermission(permissions, ["events.view", "events.create"])).toBe(true);
  });
});
