module.exports = {
  purge: ["./components/**/*.js", "./pages/**/*.js"],
  theme: {
    spacing: {
      0: "0px",
      0.5: "2px",
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "20px",
      6: "24px",
      8: "32px",
      10: "40px",
      12: "48px",
      16: "64px",
      20: "80px",
      24: "96px",
      32: "128px",
      40: "160px",
      48: "192px",
      56: "224px",
      64: "256px",
    },
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
