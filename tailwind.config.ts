import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0b0b0f",
          800: "#141421",
          700: "#1f1f2e",
        },
        blush: {
          50: "#fff6f5",
          100: "#fee9e6",
          200: "#fdc9c1",
          500: "#f27272",
        },
        mint: {
          100: "#dff5ef",
          500: "#2fb58d",
        },
        sand: {
          50: "#fbf7f0",
          200: "#f2e7d7",
          400: "#d8c2a1",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 40px rgba(15, 15, 25, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
