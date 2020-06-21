module.exports = {
  purge: ["./components/**/*.js", "./pages/**/*.js"],
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
        desktop: "repeat(7, 64px)",
      },
      gridTemplateRows: {
        desktop: "repeat(6, 44px)",
      },
    },
  },
  variants: {
    textColor: ["responsive", "hover", "focus", "active"],
    backgroundColor: ["responsive", "hover", "focus", "active"],
  },
  plugins: [],
};
