import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    // Hard-set the design system. No accidental defaults bleeding in.
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#0A0A0A",
      ink: "#0A0A0A",
      bone: "#EDE7DC",
      paper: "#F2EFEA",
      muted: "#6B6660",
      line: "#1C1C1C",
      accent: "#C9A66B",
      white: "#FFFFFF",
    },
    fontFamily: {
      display: ["var(--font-display)", "Cormorant Garamond", "ui-serif", "Georgia", "serif"],
      sans: ["var(--font-sans)", "Inter Tight", "ui-sans-serif", "system-ui", "sans-serif"],
      mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
    },
    fontSize: {
      // Fluid-ish base scale. Hero/display sizes use arbitrary clamp() in JSX.
      "label": ["0.6875rem", { lineHeight: "1", letterSpacing: "0.18em" }],
      "label-lg": ["0.75rem", { lineHeight: "1", letterSpacing: "0.2em" }],
      "xs": ["0.75rem", { lineHeight: "1.4" }],
      "sm": ["0.875rem", { lineHeight: "1.55" }],
      "base": ["1rem", { lineHeight: "1.65" }],
      "lg": ["1.125rem", { lineHeight: "1.55" }],
      "xl": ["1.375rem", { lineHeight: "1.45" }],
      "2xl": ["1.75rem", { lineHeight: "1.3" }],
      "3xl": ["2.25rem", { lineHeight: "1.15" }],
      "4xl": ["3rem", { lineHeight: "1.08" }],
      "5xl": ["4rem", { lineHeight: "1.02" }],
      "6xl": ["5.5rem", { lineHeight: "0.98" }],
      "7xl": ["7.5rem", { lineHeight: "0.95" }],
    },
    letterSpacing: {
      tightest: "-0.04em",
      tighter: "-0.025em",
      tight: "-0.015em",
      normal: "0",
      wide: "0.05em",
      wider: "0.1em",
      widest: "0.18em",
      caps: "0.2em",
    },
    extend: {
      spacing: {
        "edge": "clamp(1.25rem, 3vw, 3rem)",
        "section": "clamp(6rem, 14vh, 12rem)",
      },
      transitionTimingFunction: {
        // Slow, deliberate easing for the whole site.
        cinema: "cubic-bezier(0.7, 0, 0.3, 1)",
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "700": "700ms",
        "900": "900ms",
        "1200": "1200ms",
      },
      maxWidth: {
        prose: "62ch",
      },
    },
  },
  plugins: [],
};

export default config;
