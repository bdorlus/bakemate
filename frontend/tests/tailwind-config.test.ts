import { describe, it, expect } from "vitest";
import config from "../tailwind.config.js";

describe("tailwind theme", () => {
  it("exposes custom color tokens", () => {
    expect(config.theme.extend.colors).toMatchObject({
      app: { bg: "#FFF1F2" },
      primary: { hover: "#FB7185" },
      chart: { line: "#7C3AED" },
      status: { completedFg: "#065F46" },
    });
  });
});

