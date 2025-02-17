import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)"
      },
      animation: {
        waveform: "waveform 1.2s ease-in-out infinite"
      },
      keyframes: {
        waveform: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" }
        }
      },
      animationDelay: {
        100: "100ms",
        200: "200ms",
        300: "300ms"
      }
    }
  },
  plugins: [require("tailwindcss-animation-delay")]
} satisfies Config;
