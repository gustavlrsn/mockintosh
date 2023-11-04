import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useOutsideClick } from "../lib/hooks/useOutsideClick";
import EvenWidth from "./even-width";
import useEvenWidth from "../lib/hooks/useEvenWidth";
import { SystemContext } from "@/pages";
const Icon = ({
  icon: { title, img, type, payload, droppable, menubar },
  path,
  openWindow,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const { openWindows } = React.useContext(SystemContext);
  const isWindowOpen =
    openWindows.length && openWindows[openWindows.length - 1]?.title === title;
  // const open = Boolean(openWindows.find((window) => window.title === title));
  const open = false;
  const evenWidthRef = useEvenWidth();

  const { isOver, setNodeRef } = useDroppable({
    id: path,
    disabled: !droppable,
  });
  const handleClickOutside = () => {
    setIsSelected(false);
  };
  const ref = useOutsideClick(handleClickOutside);

  return (
    <div
      className={`flex-none pt-2 flex items-center flex-col`}
      style={{ direction: "ltr" }}
      ref={ref}
      onClick={() => setIsSelected(true)}
      onDoubleClick={() => {
        openWindow({
          title,
          type,
          payload,
          path,
          menubar,
        });
      }}
    >
      {/* {isWindowOpen ? (
        <div className={`bg-checkers w-8 h-8  ${isSelected ? "invert" : ""}`} />
      ) : (
        <img src={img} className={`w-8 h-8 ${(isSelected || isWindowOpen) ? "invert" : ""}`} />
      )} */}
      <img
        src={img}
        className={`w-8 h-8 ${isSelected || isWindowOpen ? "invert" : ""}`}
      />

      {/* <EvenWidth> */}
      <div
        className={`px-0.5 h-3 font-geneva whitespace-no-wrap ${
          isSelected ? "bg-black text-white" : "bg-white"
        }`}
        // style={{ display: "inline-table" }}
        // ref={evenWidthRef}
      >
        <span className="font-geneva">{title}</span>
      </div>
      {/* </EvenWidth> */}
    </div>
  );
};

export default Icon;
