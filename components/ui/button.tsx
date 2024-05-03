import { cn } from "@/lib/utils";
import React from "react";

export const Button = ({ children, disabled, onClick, className }) => (
  <div className="relative">
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "border drop-shadow-default font-chicago bg-white relative py-0.5 px-1",
        // !disabled &&
        //   "active:drop-shadow-none active:-right-px active:-bottom-px",
        !disabled && "active:invert",

        className
      )}
    >
      <React.Fragment>
        {children}

        {disabled && <div className="disabled absolute inset-0"></div>}
      </React.Fragment>
    </button>
  </div>
);
