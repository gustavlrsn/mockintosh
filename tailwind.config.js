module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    boxShadow: {
      default: "1px 1px 0 black",
    },
    listStyleType: {
      none: "none",
      square: "square",
    },
    extend: {
      gridTemplateColumns: {
        desktop: "repeat(6, 64px)",
      },
      gridTemplateRows: {
        desktop: "repeat(5, 44px)",
      },
    },
  },
  variants: {
    textColor: ["responsive", "hover", "focus", "active"],
    backgroundColor: ["responsive", "hover", "focus", "active"],
  },
  plugins: [],
};
