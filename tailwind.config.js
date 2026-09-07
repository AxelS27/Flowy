/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        strawberry: {
          DEFAULT: "#FF5C8A",
          dark: "#E03B6B",
          light: "#FFE4EC",
        },
        sunny: {
          DEFAULT: "#FFC837",
          dark: "#E5A817",
          light: "#FFF6D6",
        },
        mint: {
          DEFAULT: "#2DD4BF",
          dark: "#14B8A6",
          light: "#CCFBF1",
        },
        blueberry: {
          DEFAULT: "#60A5FA",
          dark: "#3B82F6",
          light: "#DBEAFE",
        },
        grape: {
          DEFAULT: "#C084FC",
          dark: "#A855F7",
          light: "#F3E8FF",
        },
        cream: {
          DEFAULT: "#FFFDF9",
          dark: "#EDE7DE",
          card: "#FFFFFF",
          border: "#F0EAE1",
        },
        ink: {
          DEFAULT: "#2D3748",
          muted: "#718096",
          light: "#A0AEC0",
        },
      },
      fontFamily: {
        sans: [
          "'Nunito'",
          "'Fredoka'",
          "'Segoe UI'",
          "Roboto",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        "tactile-strawberry": "0 5px 0 #E03B6B",
        "tactile-mint": "0 5px 0 #14B8A6",
        "tactile-sunny": "0 5px 0 #E5A817",
        "tactile-blueberry": "0 5px 0 #3B82F6",
        "tactile-grape": "0 5px 0 #A855F7",
        "tactile-card": "0 6px 0 #EDE7DE",
        "tactile-card-hover": "0 9px 0 #EDE7DE",
        "tactile-island": "0 10px 30px rgba(0, 0, 0, 0.25), 0 4px 0 #1E293B",
      },
      animation: {
        "float-gentle": "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.85, transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
