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
    },
  },
  plugins: [],
};

export default config;
