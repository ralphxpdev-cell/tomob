import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Nano Banana Design System
        banana: {
          DEFAULT: "#facc15", // yellow-400
          dark: "#eab308", // yellow-500
          light: "#fde047", // yellow-300
        },
        surface: {
          DEFAULT: "#0a0a0a", // neutral-950
          card: "#171717", // neutral-900
          border: "#262626", // neutral-800
          hover: "#1f1f1f",
        },
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
