import { useState } from "react";
import toggleFullscreen from "../utils/toggleFullscreen";
import { windowTypes } from "../pages/index";
import Button from "components/button";
// import Login from "components/login";
import { signin, signout } from "next-auth/client";

const MenuItem = ({ children, dropdown, left }) => {
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
            <div
              className={
                "absolute z-20 py-1 flex flex-col items-stretch top-0 mt-5 bg-white border-t-0 border border-black shadow" +
                " " +
                (left ? "right-0" : "left-0")
              }
            >
              <DropdownContent closeDropdown={() => setDropdownOpen(false)} />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ({ openWindow, zoom, setZoom, user }) => {
  return (
    <div className="corner-top bg-white px-2 h-5 border-b border-black flex items-stretch justify-between">
      <div className="flex items-stretch relative">
        <MenuItem
          dropdown={({ closeDropdown }) => (
            <>
              <button
                className="px-3 py-1 focus:outline-none whitespace-no-wrap font-chicago text-left block hover:bg-black hover:text-white"
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
                className="px-3 py-1 block font-chicago hover:bg-black hover:text-white"
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
      <div className="flex items-stretch relative">
        <MenuItem
          left
          dropdown={({ closeDropdown }) =>
            user ? (
              <>
                {/* <button
                  className="px-3 py-1 focus:outline-none whitespace-no-wrap font-chicago text-left block hover:bg-black hover:text-white"
                  onClick={() => {
                    openWindow({
                      title: user.name,
                      type: windowTypes.FILE,
                    });
                    closeDropdown();
                  }}
                >
                  View Profile
                </button> */}
                <button
                  className="px-3 py-1 focus:outline-none whitespace-no-wrap font-chicago text-left block hover:bg-black hover:text-white"
                  onClick={signout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                className="px-3 pr-5 py-1 focus:outline-none group flex items-center whitespace-no-wrap font-chicago text-left hover:bg-black hover:text-white"
                onClick={() => {
                  signin("twitter");
                  closeDropdown();
                }}
              >
                <img
                  src="/twitter.png"
                  className="mr-2 group-hover:inverted"
                  style={{ width: 13, height: 10 }}
                />
                Sign In with Twitter
              </button>
            )
          }
        >
          <img
            src="/user2.png"
            className=""
            style={{
              height: 15,
              width: 12,
            }}
          />
        </MenuItem>
      </div>
    </div>
  );
};
