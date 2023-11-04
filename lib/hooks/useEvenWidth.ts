import { useEffect, useRef } from "react";

const useEvenWidth = () => {
  const ref = useRef(null);

  useEffect(() => {
    const adjustWidth = () => {
      const current = ref.current;
      if (current) {
        const width = current.offsetWidth;
        console.log(width);
        if (width % 2 !== 0) {
          current.style.width = `${width + 1}px`;
        }
      }
    };

    // window.addEventListener("resize", adjustWidth);

    // Initial adjustment
    adjustWidth();

    // return () => {
    //   window.removeEventListener("resize", adjustWidth);
    // };
  }, [ref.current]);

  return ref;
};

export default useEvenWidth;
