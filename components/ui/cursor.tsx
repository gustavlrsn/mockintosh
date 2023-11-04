import { cva } from "class-variance-authority";

export const cursor = cva("", {
  variants: {
    zoom: {
      1: "",
      2: "",
      3: "",
    },
    type: {
      default: "",
      text: "",
    },
  },
  compoundVariants: [
    {
      type: "default",
      zoom: 1,
      className: "cursor-default-1",
    },
    {
      type: "default",
      zoom: 2,
      className: "cursor-default-2",
    },
    {
      type: "default",
      zoom: 3,
      className: "cursor-default-3",
    },
    {
      type: "text",
      zoom: 1,
      className: "cursor-text-1",
    },
    {
      type: "text",
      zoom: 2,
      className: "cursor-text-2",
    },
    {
      type: "text",
      zoom: 3,
      className: "cursor-text-3",
    },
  ],
  defaultVariants: {
    type: "default",
    zoom: 1,
  },
});
