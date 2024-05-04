import React from "react";

export function Icon({
  selected,
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
      <img src={img} className={`w-8 h-8 ${selected ? "invert" : ""}`} />

      <div
        className={`px-0.5 h-3 font-geneva whitespace-no-wrap ${
          selected ? "bg-black text-white" : "bg-white"
        }`}
      >
        <span className="font-geneva">{label}</span>
      </div>
    </button>
  );
}
