/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--primary) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        thirdly: "rgb(var(--thirdly) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        componentsBackground:
          "rgb(var(--componentsBackground) / <alpha-value>)",
        textMain: "rgb(var(--textMain) / <alpha-value>)",
        textSecond: "rgb(var(--textSecond) / <alpha-value>)",
        textThird: "rgb(var(--textThird) / <alpha-value>)"
      }
    }
  },
  plugins: []
};
