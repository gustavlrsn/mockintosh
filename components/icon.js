import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useOutsideClick } from "../lib/hooks/useOutsideClick";

const Icon = ({
  icon: { title, img, type, payload, droppable },
  path,
  openWindow,
  openWindows,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const isWindowOpen =
    openWindows.length && openWindows[openWindows.length - 1].title === title;
  // const open = Boolean(openWindows.find((window) => window.title === title));
  const open = false;

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
      className={`col-start-7 flex-none flex items-center flex-col ${
        (open ? "cursor-default" : "cursor-pointer") +
        " " +
        (title === "Trash" ? "place-self-end" : "")
      }`}
      style={{ minWidth: 64 }}
      ref={ref}
      onClick={() => setIsSelected(true)}
      onDoubleClick={() => {
        openWindow({
          title,
          type,
          payload,
          path,
        });
      }}
    >
      {isWindowOpen ? (
        <div
          className={`bg-checkers w-8 h-8  ${isSelected ? "inverted" : ""}`}
        />
      ) : (
        <img src={img} className={`w-8 h-8 ${isSelected ? "inverted" : ""}`} />
      )}

      <span
        className={`block font-geneva whitespace-no-wrap ${
          isSelected ? "bg-black text-white" : "bg-white"
        }`}
        style={{ padding: "0 2px", display: "inline-table" }}
      >
        {title}
      </span>
    </div>
  );
};

export default Icon;
