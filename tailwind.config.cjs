module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Base themes
        ink: "rgb(var(--color-ink) / <alpha-value>)", // adaptive slate-900/slate-100
        paper: "#f8fafc", // slate-50
        marigold: "#f97316", // orange-500
        coral: "#f43f5e", // rose-500
        peachglass: "#ffedd5", // orange-100
        
        // Dark mode specific
        darkink: "#f1f5f9", // slate-100
        darkpaper: "#020617", // slate-950
        darkmarigold: "#fb923c", // orange-400
        darkcoral: "#fb7185",
        
        // UI
        surface: "rgba(255, 255, 255, 0.7)",
        darksurface: "rgba(15, 23, 42, 0.7)",
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(0,0,0,0.08)",
        glow: "0 0 20px rgba(16, 185, 129, 0.3)",
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pop": "pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.95)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
