import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        garet: ["var(--font-garet-book)", ...defaultTheme.fontFamily.sans],
        kagitingan: [
          "var(--font-kagitingan-bold)",
          ...defaultTheme.fontFamily.sans,
        ],
        monument: ["var(--font-monument)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Summit Theme Colors
        summit: {
          white: "#FFFFFF",
          black: "#393939",
          "light-gray": "#FBF8EF",
          blue: "#4D69EE",
          teal: "#18D9CE",
          pink: "#FC4C7A",
          orange: "#FEA621",
          purple: "#F7B9EA",
          "dark-gray": "#0F110E",
          navy: "#202E4E",
        },
        // shadcn/ui semantic colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
  plugins: [],
};

export default config;
