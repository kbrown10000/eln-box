import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A2540",
        secondary: "#F6F9FC",
        accent: "#00C49A",
        "text-body": "#525F7F",
        "border-light": "#E6E6E6",
      },
      fontFamily: {
        heading: ["var(--font-roboto-slab)", "serif"],
        body: ["var(--font-roboto)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
