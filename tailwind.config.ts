import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        green: "var(--green)",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)", "Noto Sans JP", "sans-serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"],
        rounded: ["var(--font-rounded)", "M PLUS Rounded 1c", "sans-serif"],
        mincho: ["var(--font-mincho)", "Shippori Mincho", "serif"],
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "calc(0.625rem + 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
