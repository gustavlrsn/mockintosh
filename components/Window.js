import Draggable from "react-draggable"; // The default

export default ({
  close,
  title,
  children,
  defaultPosition = { x: 450, y: 50 },
}) => {
  return (
    <Draggable handle=".handle" defaultPosition={defaultPosition}>
      <div className="absolute text-sm border border-black  border-r-2 border-b-2 bg-white w-64 ">
        <div className="handle border-b border-black h-5 flex items-center justify-center text-sm">
          <div
            className="bg-stripes"
            style={{ height: 11, width: 6, marginLeft: 1, marginRight: 1 }}
          ></div>
          <button
            className="border border-black focus:outline-none"
            onClick={close}
            style={{ height: 11, width: 11 }}
          ></button>
          <div
            className="bg-stripes flex-grow"
            style={{ height: 11, marginLeft: 1, marginRight: 1 }}
          ></div>
          <span
            className="font-chicago"
            style={{
              marginLeft: 5,
              marginRight: 5,
            }}
          >
            {title}
          </span>
          <div
            className="bg-stripes flex-grow"
            style={{ height: 11, marginLeft: 1, marginRight: 1 }}
          ></div>
        </div>
        {children}
      </div>
    </Draggable>
  );
};