import { describe, it, expect } from "vitest";
import config from "../tailwind.config.js";

describe("tailwind theme", () => {
  it("exposes custom color tokens", () => {
    expect(config.theme.extend.colors).toMatchObject({
      brand: { accent: "#FF86C1", ink: "#3E1E68" },
      app: { bg: "#F9F7F5", sidebar: "#3E1E68" },
      primary: { hover: "#FB6CAD" },
      chart: { lineSecondary: "#5B2C86" },
      status: { completedFg: "#065F46" },
    });
  });
});

