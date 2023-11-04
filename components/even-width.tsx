import React, { useRef, useEffect, useState } from "react";

const EvenWidth = ({ children }) => {
  const childRef = useRef(null);
  const [adjustedWidth, setAdjustedWidth] = useState(null);

  useEffect(() => {
    if (childRef.current) {
      const width = childRef.current.offsetWidth;
      const evenWidth = width % 2 === 0 ? width : width - 1;
      setAdjustedWidth(evenWidth);
    }
  }, [children]);
  console.log({ adjustedWidth, ogWidth: childRef?.current?.offsetWidth });
  // Clone the child with the ref and adjusted style
  return React.cloneElement(children, {
    ref: childRef,
    style: {
      ...children.props.style,
      width: adjustedWidth,
    },
  });
};

export default EvenWidth;
