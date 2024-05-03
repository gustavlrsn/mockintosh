import * as React from "react";

import { cn } from "@/lib/utils";
import { SystemContext } from "@/pages";
import { cursor } from "@/components/ui/cursor";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const { zoom } = React.useContext(SystemContext);
    return (
      <input
        type={type}
        spellCheck={false}
        className={cn(
          "border font-chicago h-4 px-1 cursor-none",
          // cursor({ type: "text", zoom }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
