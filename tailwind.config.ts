import type { Config } from "tailwindcss";

const defaultTheme = require("tailwindcss/defaultTheme");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        oatmeal: "var(--oatmeal)",
        bark: "var(--bark)",
      },
      fontFamily: {
        sans: ["var(--font-soehne)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-tobias)", ...defaultTheme.fontFamily.serif],
      },
      lineHeight: {
        relaxed: "1.1",
      },
    },
  },
  plugins: [],
};
export default config;
