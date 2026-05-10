import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101316",
        graphite: "#2d3339",
        muted: "#66717c",
        line: "#dbe1e7",
        wash: "#f6f8fa",
        teal: {
          50: "#ecfdf9",
          100: "#d1fbf1",
          500: "#11a68a",
          700: "#08735f"
        },
        amber: {
          50: "#fff8e6",
          200: "#ffe29a",
          500: "#d99100"
        }
      },
      boxShadow: {
        tight: "0 1px 0 rgba(16, 19, 22, 0.04), 0 8px 28px rgba(16, 19, 22, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
