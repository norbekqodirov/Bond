import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      create: vi.fn(async (args) => ({ id: "evt_1", ...args }))
    }
  }
}));

import { createEvent } from "@/lib/repositories/events";

describe("createEvent", () => {
  it("creates an event with mapped enums", async () => {
    const payload = {
      type: "olympiad",
      status: "draft",
      translations: [
        {
          locale: "uz",
          title: "Test event",
          subtitle: null,
          description: null,
          rules: null,
          seoTitle: null,
          seoDescription: null
        }
      ]
    };

    const result = await createEvent(payload);

    expect(result.data.type).toBe("OLYMPIAD");
    expect(result.data.status).toBe("DRAFT");
    expect(result.data.translations.create[0].locale).toBe("UZ");
  });
});
