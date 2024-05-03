import React from "react";
import Draggable from "react-draggable"; // The default
import { SystemContext } from "../../pages/index";
import clsx from "clsx";
import { cn } from "@/lib/utils";

export const WindowContext = React.createContext({
  active: false,
  defaultPosition: { x: 0, y: 0 },
});

interface WindowProps {
  i: number;
  title: string;
  children: React.ReactNode;
  width: number;
  defaultPosition: { x: number; y: number };
}

export function Window({
  i,
  title,
  children,
  width,
  defaultPosition,
}: WindowProps) {
  const { closeWindow, bringWindowToFront, openWindows, zoom } =
    React.useContext(SystemContext);
  const active = i === openWindows.length - 1;

  return (
    <WindowContext.Provider
      value={{
        active,
        defaultPosition,
      }}
    >
      <Draggable
        handle=".handle"
        defaultPosition={defaultPosition}
        onMouseDown={() => bringWindowToFront(title)}
        scale={zoom}
        grid={[zoom, zoom]}
      >
        <div className="absolute text-sm border flex flex-col overflow-hidden border-black drop-shadow-default bg-white z-10">
          <div
            className="handle shrink-0 border-b border-black h-5 flex items-center justify-center text-sm"
            style={{ width }}
          >
            <div
              className={active ? "bg-stripes" : ""}
              style={{ height: 11, width: 6, marginLeft: 1, marginRight: 1 }}
            ></div>
            <button
              className={clsx(
                "border focus:outline-none h-[11px] w-[11px]",
                active ? "border-black" : "border-transparent"
              )}
              onClick={() => {
                console.log("closing window w title:", title);
                closeWindow(title);
              }}
            ></button>
            <div
              className={clsx(
                "ml-px mr-px h-[11px] flex-grow",
                active && "bg-stripes"
              )}
            ></div>
            <span className="font-chicago ml-[5px] mr-[5px]">{title}</span>
            <div
              className={clsx(
                "flex-grow h-[11px] w-4 ml-px mr-px",
                active && "bg-stripes"
              )}
            ></div>
          </div>
          {children}
        </div>
      </Draggable>
    </WindowContext.Provider>
  );
}

export function WindowHeader({ children }) {
  return (
    <div className="border-b">
      <div className="border-b border-transparent">
        <div className="border-b">{children}</div>
      </div>
    </div>
  );
}

export function WindowScrollArea({ children, resizable, className }) {
  const { active, defaultPosition } = React.useContext(WindowContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }
    const maxHeight = 316 - defaultPosition.y - ref.current.offsetTop;
    const height =
      ref.current.offsetHeight > maxHeight
        ? maxHeight
        : ref.current.offsetHeight;

    ref.current.style.height = `${height}px`;
  }, [ref.current]);

  return (
    <div
      ref={ref}
      className={cn(
        "scroll w-64 min-w-[200px] min-h-[80px]",
        !active && "inactive",
        resizable && "overflow-scroll resize",
        className
      )}
    >
      {children}
    </div>
  );
}
