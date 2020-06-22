import { useState } from "react";
import toggleFullscreen from "../utils/toggleFullscreen";
import { windowTypes } from "../pages/index";

const MenuItem = ({ children, dropdown }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const DropdownContent = dropdown;
  return (
    <>
      <div className="relative flex items-stretch">
        {!dropdown && <div className="absolute inset-0 disabled"></div>}
        <button
          className={`font-chicago focus:outline-none px-2 ${
            (dropdownOpen ? "inverted bg-white" : "") +
            " " +
            (dropdown ? "cursor-pointer" : "cursor-default")
          }`}
          onMouseDown={() => dropdown && setDropdownOpen(!dropdownOpen)}
        >
          {children}
        </button>
        {dropdownOpen && (
          <>
            <button
              onClick={() => setDropdownOpen(false)}
              tabIndex="-1"
              className="z-10 fixed inset-0 h-full w-full cursor-default focus:outline-none"
            ></button>
            <div className="absolute w-48 z-20 py-1 flex flex-col items-stretch left-0 top-0 mt-5 font-chicago bg-white border-t-0 border border-black shadow">
              <DropdownContent closeDropdown={() => setDropdownOpen(false)} />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ({ openWindow, zoom, setZoom }) => {
  return (
    <div className="corner-top bg-white px-2 h-5 border-b border-black flex items-stretch justify-between">
      <div className="flex items-stretch relative">
        <MenuItem
          dropdown={({ closeDropdown }) => (
            <>
              <button
                className="px-3 py-1 focus:outline-none font-chicago text-left block hover:bg-black hover:text-white"
                onClick={() => {
                  openWindow({
                    title: "About This Mockintosh",
                    type: windowTypes.ABOUT_THIS_MOCKINTOSH,
                  });
                  closeDropdown();
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
            </>
          )}
        >
          <img
            src="/eaten_apple.png"
            className=""
            style={{
              height: 11,
              width: 9,
            }}
          />
        </MenuItem>
        <MenuItem>File</MenuItem>
        <MenuItem>Edit</MenuItem>
        <MenuItem>View</MenuItem>
        <MenuItem>Special</MenuItem>
      </div>
    </div>
  );
};
