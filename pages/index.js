import Head from "next/head";
import { useState } from "react";
import Window from "../components/window";
import File from "../components/file";
import { getFileContent } from "../lib/api";
import PhotoBooth from "../components/photobooth";
import Icon from "../components/icon";
import toggleFullscreen from "../utils/toggleFullscreen";

const windowTypes = {
  PHOTO_BOOTH: "PHOTO_BOOTH",
  FILE: "FILE",
  FOLDER: "FOLDER",
};

const getDefaultPosition = (openWindows) => {
  if (openWindows.length) {
    const posBelow = {
      x: openWindows[openWindows.length - 1].defaultPosition.x,
      y: openWindows[openWindows.length - 1].defaultPosition.y,
    };
    return {
      x: posBelow.x > 25 ? posBelow.x - 25 : posBelow.x + 25,
      y: posBelow.y > 25 ? posBelow.y + 25 : posBelow.y + 25,
    };
  } else {
    return {
      x: 130,
      y: 15,
    };
  }
};

export default ({ initialWindows, icons }) => {
  const [openWindows, setOpenWindows] = useState(initialWindows);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const closeWindow = (title) =>
    setOpenWindows([...openWindows.filter((window) => window.title !== title)]);

  const openWindow = (window) => {
    const windowIsOpen = Boolean(
      openWindows.find((openWindow) => openWindow.title === window.title)
    );

    if (windowIsOpen) {
      bringWindowToFront(window.title);
    } else {
      const defaultPosition = getDefaultPosition(openWindows);
      setOpenWindows([...openWindows, { defaultPosition, ...window }]);
    }
  };

  const bringWindowToFront = (title) => {
    if (
      openWindows.length &&
      openWindows[openWindows.length - 1].title !== title
    )
      setOpenWindows([
        ...openWindows.sort((a, b) => {
          if (a.title === title) return 1;
          if (b.title === title) return -1;
          return 0;
        }),
      ]);
  };

  return (
    <>
      <Head>
        <title>Pluto</title>
        <meta property="og:title" content="Pluto" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://plutocomputer.club" />
        <meta property="og:image" content="https://plutocomputer.club/og.png" />
      </Head>
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div
          style={{ width: 512, height: 342 }}
          className="flex corner-bottom flex-col overflow-hidden"
        >
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
                    src="/pluto.png"
                    className="mr-2"
                    style={{ height: 11, width: 11 }}
                  />
                  <h1 className="font-chicago">Pluto</h1>
                </div>
              </button>
              {dropdownOpen && (
                <>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    tabIndex="-1"
                    className="z-10 fixed inset-0 h-full w-full cursor-default"
                  ></button>
                  <div className="absolute w-40 z-20 py-1 flex flex-col items-stretch left-0 top-0 mt-5 font-chicago bg-white border-t-0 border-b-2 border-r-2 border border-black">
                    {/* <div className="px-4 py-1 hover:bg-black hover:text-white">
                    About This Computer...
                  </div>
                  <hr className="border-b-1 border-black border-dotted my-1" /> */}
                    <button
                      className="px-4 py-1 focus:outline-none font-chicago text-left block hover:bg-black hover:text-white"
                      onClick={toggleFullscreen}
                    >
                      Full Screen
                    </button>
                    <a
                      className="px-4 py-1 block hover:bg-black hover:text-white"
                      href="https://github.com/plutocomputerclub/pluto"
                      target="_blank"
                    >
                      View Source
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Windows */}
          <div className="flex-grow ">
            {openWindows.map((window, i) => {
              switch (window.type) {
                case windowTypes.FOLDER:
                  return (
                    <Window
                      key={window.title}
                      window={window}
                      closeWindow={closeWindow}
                      bringWindowToFront={bringWindowToFront}
                      active={i === openWindows.length - 1}
                    >
                      <div className="p-5 overflow-hidden flex">
                        {window.payload.icons.map((icon) => (
                          <Icon
                            key={icon.title}
                            icon={icon}
                            openWindow={openWindow}
                            openWindows={openWindows}
                          />
                        ))}
                      </div>
                    </Window>
                  );
                case windowTypes.FILE:
                  return (
                    <Window
                      key={window.title}
                      window={window}
                      closeWindow={closeWindow}
                      bringWindowToFront={bringWindowToFront}
                      active={i === openWindows.length - 1}
                    >
                      <File {...window.payload} />
                    </Window>
                  );
                case windowTypes.PHOTO_BOOTH:
                  return (
                    <Window
                      key={window.title}
                      window={window}
                      closeWindow={closeWindow}
                      bringWindowToFront={bringWindowToFront}
                      active={i === openWindows.length - 1}
                      width={259}
                    >
                      <PhotoBooth active={i === window.length - 1} />
                    </Window>
                  );
              }
            })}

            {/* Icons */}
            <div className="flex justify-end py-3 px-2">
              <div className="grid grid-cols-1 gap-0">
                {icons.map((icon) => (
                  <Icon
                    key={icon.title}
                    icon={icon}
                    openWindow={openWindow}
                    openWindows={openWindows}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticProps() {
  const initialWindows = [];

  const icons = [
    {
      title: "Photo booth",
      type: windowTypes.PHOTO_BOOTH,
      img: "/icons/film.png",
      payload: {},
    },

    {
      title: "Development",
      type: windowTypes.FOLDER,
      img: "/icons/folder.png",
      payload: {
        icons: [
          {
            title: "README.md",
            type: windowTypes.FILE,
            img: "/icons/file.png",
            payload: {
              content: await getFileContent("README.md"),
            },
          },
          {
            title: "CONTRIBUTING.md",
            type: windowTypes.FILE,
            img: "/icons/file.png",
            payload: {
              content: await getFileContent("CONTRIBUTING.md"),
            },
          },
          {
            title: "todo.md",
            type: windowTypes.FILE,
            img: "/icons/file.png",
            payload: {
              content: await getFileContent("todo.md"),
            },
          },
        ],
      },
    },
  ];

  return {
    props: { initialWindows, icons },
  };
}
