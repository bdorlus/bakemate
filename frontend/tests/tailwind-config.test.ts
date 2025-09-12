import { describe, it, expect } from "vitest";
import config from "../tailwind.config.js";

describe("tailwind theme", () => {
  it("exposes custom color tokens", () => {
    expect(config.theme.extend.colors).toMatchObject({
      brand: { accent: "#FF86C1" },
      app: { bg: "#F9F7F5" },
      primary: { hover: "#FB6CAD" },
      chart: { lineSecondary: "#2A22AA" },
      status: { completedFg: "#065F46" },
    });
  });
});

