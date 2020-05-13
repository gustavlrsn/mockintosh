const getDefaultPosition = (openWindows) => {
  if (openWindows.length) {
    const posBelow = {
      x: openWindows[openWindows.length - 1].defaultPosition.x,
      y: openWindows[openWindows.length - 1].defaultPosition.y,
    };
    return {
      x: posBelow.x > 25 ? posBelow.x - 25 : posBelow.x + 25,
      y: posBelow.y > 25 ? posBelow.y + 25 : posBelow.y + 25,
    };
  } else {
    return {
      x: 130,
      y: 15,
    };
  }
};

export default getDefaultPosition;
