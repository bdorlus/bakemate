import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
        ],
      },
      colors: {
        brand: {
          surface: "#F9F7F5", // light surface
          accent: "#FF86C1", // whisk pink
          ink: "#2A22AA", // deep slate/indigo
        },
        // App surfaces
        app: {
          bg: "#F9F7F5",
          card: "#FFFFFF",
          ring: "#F1F5F9",
          text: "#0F172A",
          muted: "#64748B",
          sidebar: "#2A22AA",
          sidebarHover: "#3B32D0",
        },
        // Actions
        primary: {
          DEFAULT: "#FF86C1",
          hover: "#FB6CAD",
          foreground: "#0F172A",
        },
        // Charts
        chart: {
          linePrimary: "#FF86C1",
          lineSecondary: "#2A22AA",
          fillFrom: "#FFE0EE",
          fillTo: "#F9F7F5",
          grid: "#EAEFF5",
          bar1: "#FF86C1",
          bar2: "#8EA6FF",
          bar3: "#8DE0C1",
        },
        // Badges
        status: {
          openBg: "#FEF3C7", openFg: "#92400E",
          quotedBg: "#E0E7FF", quotedFg: "#3730A3",
          completedBg: "#D1FAE5", completedFg: "#065F46",
          lateBg: "#FFE4E6", lateFg: "#9F1239",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(2,6,23,0.04), 0 8px 24px rgba(2,6,23,0.06)",
        lift: "0 8px 16px rgba(2,6,23,0.10)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
      },
    },
  },
  plugins: [forms, typography],
};
