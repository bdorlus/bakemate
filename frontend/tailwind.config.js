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
          "Apple Color Emoji",
          "Segoe UI Emoji",
        ],
      },
      colors: {
        // App surfaces
        app: {
          bg: "#FFF1F2", // pink-50 page background
          card: "#FFFFFF",
          ring: "#F1F5F9", // slate-100
          text: "#0F172A", // slate-900
          muted: "#64748B", // slate-500/600
          sidebar: "#0F172A", // slate-900
          sidebarHover: "#1F2937", // slate-800
        },
        // Actions
        primary: {
          DEFAULT: "#FDA4AF", // rose-300
          hover: "#FB7185", // rose-400
          foreground: "#0F172A",
        },
        // Charts
        chart: {
          line: "#7C3AED", // violet-600
          fillFrom: "#E9D5FF", // violet-200
          fillTo: "#FCE7F3", // rose-100
          barAmber: "#FCD34D",
          barTeal: "#34D399",
          barSky: "#38BDF8",
          grid: "#F1F5F9", // slate-100
        },
        // Badges
        status: {
          openBg: "#FEF3C7", // amber-100
          openFg: "#92400E", // amber-800
          quotedBg: "#E0E7FF", // indigo-100
          quotedFg: "#3730A3", // indigo-800
          completedBg: "#D1FAE5", // emerald-100
          completedFg: "#065F46", // emerald-800
          lateBg: "#FFE4E6", // rose-100
          lateFg: "#9F1239", // rose-800
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
