import React from "react";
import { Text } from "@/components/ui/text";
import CanvasImage from "../canvas-image";

export function Icon({
  selected,
  isOpen,
  img,
  label,
  onClick,
  onDoubleClick = undefined,
}) {
  return (
    <button
      className={`flex-none flex items-center flex-col focus:outline-none`}
      style={{ direction: "ltr" }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <CanvasImage
        src={img}
        width={32}
        height={32}
        className={selected ? "invert" : ""}
        shadowOutline={isOpen}
      />

      <Text
        text={label}
        width={128}
        align="center"
        color="black"
        bg="white"
        className={selected ? "invert" : ""}
      />
    </button>
  );
}
