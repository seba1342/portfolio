import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      colors: {
        bark: "var(--bark)",
        oatmeal: "var(--oatmeal)",
        softBark: "var(--soft-bark)",
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
        sans: ["var(--font-geist)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-tobias)", ...defaultTheme.fontFamily.serif],
      },
      lineHeight: {
        relaxed: "1.1",
      },
    },
  },
};
export default config;
