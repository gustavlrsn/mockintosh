import { useState } from "react";
import toggleFullscreen from "../utils/toggleFullscreen";
import { windowTypes } from "../pages/index";

export default ({ openWindow, zoom, setZoom }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="corner-top bg-white px-2 h-5 border-b border-black flex items-stretch justify-between">
      <div className="flex items-stretch relative">
        <button
          className={`focus:outline-none px-2 mr-1 ${
            dropdownOpen ? "inverted bg-white" : ""
          }`}
          onMouseDown={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="flex items-center">
            <img
              src="/eaten_apple.png"
              className=""
              style={{
                height: 11,
                width: 9,
              }}
            />
          </div>
        </button>
        {dropdownOpen && (
          <>
            <button
              onClick={() => setDropdownOpen(false)}
              tabIndex="-1"
              className="z-10 fixed inset-0 h-full w-full cursor-default focus:outline-none"
            ></button>
            <div className="absolute w-48 z-20 py-1 flex flex-col items-stretch left-0 top-0 mt-5 font-chicago bg-white border-t-0 border-b-2 border-r-2 border border-black">
              <button
                className="px-3 py-1 focus:outline-none font-chicago text-left block hover:bg-black hover:text-white"
                onClick={() => {
                  openWindow({
                    title: "About This Mockintosh",
                    type: windowTypes.ABOUT_THIS_MOCKINTOSH,
                  });
                  setDropdownOpen(false);
                }}
              >
                About This Mockintosh...
              </button>
              <hr className="border-b-1 border-black border-dotted my-1" />

              <button
                className="px-3 py-1 focus:outline-none font-chicago text-left block hover:bg-black hover:text-white"
                onClick={toggleFullscreen}
              >
                Full Screen
              </button>
              <button
                className="px-3 py-1 focus:outline-none font-chicago text-left block hover:bg-black hover:text-white"
                onClick={() => setZoom(zoom === 1 ? 2 : 1)}
              >
                {zoom === 1 ? "Zoom In" : "Zoom Out"}
              </button>
              <a
                className="px-3 py-1 block hover:bg-black hover:text-white"
                href="https://github.com/gustavlrsn/mockintosh"
                target="_blank"
              >
                View Source
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
