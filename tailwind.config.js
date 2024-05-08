module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    boxShadow: {
      default: "1px 1px 0 black",
    },
    dropShadow: {
      default: "1px 1px 0 black",
      "r-5": "5px 0 0 black",
      none: "0 0 #0000",
    },
    borderColor: { black: "black", white: "white", transparent: "transparent" },
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
  plugins: [],
};
