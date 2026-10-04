import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#EEF3FA",
          100: "#DCE5F2",
          200: "#B9CBE4",
          300: "#8FAAD1",
          400: "#5C82B0",
          500: "#3A6394",
          600: "#2A4C78",
          700: "#1D3A61",
          800: "#132947",
          900: "#0B1B33",
          950: "#060F20",
        },
        saffron: {
          50: "#FFF6EB",
          100: "#FFEAD1",
          200: "#FFD3A3",
          300: "#FFB56B",
          400: "#FF9433",
          500: "#FF7A00",
          600: "#F05E00",
          700: "#C74A00",
          800: "#9E3B00",
          900: "#7A2E00",
        },
        cream: {
          50: "#FDFBF7",
          100: "#FAF6EF",
          200: "#F3EDE1",
          300: "#EAE0D5",
        },
        ink: {
          50: "#F6F7F8",
          100: "#ECEEF1",
          200: "#D5DAE0",
          300: "#B0B9C4",
          400: "#8593A3",
          500: "#64748B",
          600: "#4B586B",
          700: "#37424F",
          800: "#26303D",
          900: "#1A222E",
          950: "#10161C",
        },
        leaf: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: {
        "8xl": "88rem",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(11,27,51,0.08)",
        lift: "0 16px 48px rgba(11,27,51,0.14)",
        glow: "0 8px 32px rgba(255,122,0,0.25)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(40px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        dash: {
          to: { strokeDashoffset: "-24" },
        },
        pop: {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "70%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        ping2: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        imageZoom: {
          "0%": { transform: "scale(1)", filter: "brightness(1) contrast(1)" },
          "50%": { transform: "scale(1.04)", filter: "brightness(1.05) contrast(1.02)" },
          "100%": { transform: "scale(1.08)", filter: "brightness(1.02) contrast(1.01)" },
        },
        parallax: {
          "0%": { transform: "translateY(0) scale(1)" },
          "100%": { transform: "translateY(-20px) scale(1.02)" },
        },
        floatSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "fade-up": "fadeUp .6s ease both",
        "fade-up-delayed": "fadeUp .7s ease .15s both",
        "fade-up-delayed-2": "fadeUp .8s ease .3s both",
        "fade-up-delayed-3": "fadeUp .9s ease .45s both",
        "fade-in": "fadeIn .5s ease both",
        "slide-up": "slideUp .45s cubic-bezier(.32,.72,.33,1) both",
        "slide-in-right": "slideInRight .4s ease both",
        shimmer: "shimmer 1.4s linear infinite",
        floaty: "floaty 4s ease-in-out infinite",
        "float-soft": "floatSoft 3s ease-in-out infinite",
        dash: "dash 1s linear infinite",
        pop: "pop .5s cubic-bezier(.32,.72,.33,1.2) both",
        "ping-soft": "ping2 1.8s cubic-bezier(0,0,.2,1) infinite",
        "image-zoom": "imageZoom 24s ease-in-out forwards",
        parallax: "parallax 30s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
