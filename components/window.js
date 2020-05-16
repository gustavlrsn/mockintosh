import Draggable from "react-draggable"; // The default

export default ({
  closeWindow,
  window,
  children,
  active,
  width,
  bringWindowToFront,
  scale,
}) => {
  return (
    <Draggable
      handle=".handle"
      defaultPosition={window.defaultPosition}
      onMouseDown={() => bringWindowToFront(window.title)}
      scale={scale}
    >
      <div
        className="absolute text-sm border border-black  border-r-2 border-b-2 bg-white w-64"
        style={{ width }}
      >
        <div className="handle border-b border-black h-5 flex items-center justify-center text-sm">
          <div
            className={active ? "bg-stripes" : ""}
            style={{ height: 11, width: 6, marginLeft: 1, marginRight: 1 }}
          ></div>
          <button
            className={`border focus:outline-none ${
              active ? "border-black" : "border-transparent"
            }`}
            onClick={() => closeWindow(window.title)}
            style={{ height: 11, width: 11 }}
          ></button>
          <div
            className={`flex-grow ${active && "bg-stripes"}`}
            style={{ height: 11, marginLeft: 1, marginRight: 1 }}
          ></div>
          <span
            className="font-chicago"
            style={{
              marginLeft: 5,
              marginRight: 5,
            }}
          >
            {window.title}
          </span>
          <div
            className={`flex-grow ${active && "bg-stripes"}`}
            style={{ height: 11, marginLeft: 1, marginRight: 1 }}
          ></div>
        </div>
        {children}
      </div>
    </Draggable>
  );
};
