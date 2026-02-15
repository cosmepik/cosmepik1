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
        cream: {
          50: "#fdfcfb",
          100: "#f9f6f2",
          200: "#f2ebe3",
          300: "#e8dccf",
          400: "#d4c4b0",
        },
        gold: {
          400: "#c9a962",
          500: "#b8963d",
          600: "#9a7b2e",
          700: "#7d6426",
        },
        stone: {
          50: "#fafaf9",
          100: "#f5f5f4",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        serif: ["var(--font-geist-mono)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
