import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useOutsideClick } from "../lib/hooks/useOutsideClick";
import { SystemContext } from "@/pages";
import { isNil, omitBy } from "lodash";
import { Text } from "./ui/text";
import CanvasImage from "@/components/canvas-image";

const Icon = ({
  icon: { title, img, type, payload, droppable, menubar, defaultPosition },
  // path,
  openWindow,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const { openWindows } = React.useContext(SystemContext);
  const isWindowOpen =
    openWindows.length && openWindows[openWindows.length - 1]?.title === title;
  // const open = Boolean(openWindows.find((window) => window.title === title));
  const open = false;

  // const { isOver, setNodeRef } = useDroppable({
  //   id: path,
  //   disabled: !droppable,
  // });
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
        openWindow(
          omitBy(
            {
              title,
              type,
              payload,
              menubar,
              defaultPosition,
            },
            isNil
          )
        );
      }}
    >
      <CanvasImage
        src={img}
        width={32}
        height={32}
        shadowOutline={isWindowOpen}
        className={isSelected ? "invert" : ""}
      />

      <Text
        text={title}
        width={128}
        align="center"
        color="black"
        bg="white"
        className={isSelected ? "invert" : ""}
      />
    </div>
  );
};

export default Icon;
