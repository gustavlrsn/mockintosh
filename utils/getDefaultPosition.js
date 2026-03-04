const getDefaultPosition = (openWindows) => {
  if (openWindows.length) {
    const last = openWindows[openWindows.length - 1];
    const lastX = last.x ?? 90;
    const lastY = last.y ?? 5;
    return {
      x: lastX > 25 ? lastX - 25 : lastX + 25,
      y: lastY > 25 ? lastY - 5 : lastY + 5,
    };
  } else {
    return {
      x: 90,
      y: 5,
    };
  }
};

export default getDefaultPosition;
