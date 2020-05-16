module.exports = {
  purge: ["./components/**/*.js", "./pages/**/*.js"],
  theme: {
    listStyleType: {
      none: "none",
      square: "square",
    },
    extend: {
      gridTemplateColumns: {
        icons: "repeat(7, 64px)",
      },
      gridTemplateRows: {
        icons: "repeat(5, 44px)",
      },
    },
  },
  variants: {
    textColor: ["responsive", "hover", "focus", "active"],
    backgroundColor: ["responsive", "hover", "focus", "active"],
  },
  plugins: [],
};
