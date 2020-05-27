import Head from "next/head";
import { useState, useEffect } from "react";
import store from "store";
import Window from "../components/window";
import File from "../components/file";
import { getFileContent } from "../lib/api";
import PhotoBooth from "../components/photobooth";
import AboutThisMockintosh from "../components/about";
import Icon from "../components/icon";
import toggleFullscreen from "../utils/toggleFullscreen";
import getDefaultPosition from "../utils/getDefaultPosition";
import { version } from "../package.json";

const simulatedBootTime = 1337;

const windowTypes = {
  PHOTO_BOOTH: "PHOTO_BOOTH",
  FILE: "FILE",
  FOLDER: "FOLDER",
  ABOUT_THIS_MOCKINTOSH: "ABOUT_THIS_MOCKINTOSH",
};

export default ({ initialWindows, icons }) => {
  const [showingSplashscreen, setSplashScreen] = useState(true);
  const [settings, setSettings] = useState({ zoom: 1 });

  useEffect(() => {
    setTimeout(() => setSplashScreen(false), simulatedBootTime);

    const settingsInLocalStorage = store.get("settings");
    if (settingsInLocalStorage) {
      setSettings(settingsInLocalStorage);
    }
  }, []);

  const setSetting = (name, value) => {
    const newSettings = { ...settings, [`${name}`]: value };
    setSettings(newSettings);
    store.set("settings", newSettings);
  };

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

  const title = `mockintosh ${version}`;
  return (
    <>
      <Head>
        <meta property="og:image" content="https://mockintosh.com/og.png" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content="mock operating system" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mockintosh.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* <meta name="twitter:site" content="@plutocompclub" /> */}
        <meta name="twitter:creator" content="@gustavlrsn" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content="mock operating system" />
        <meta name="twitter:image" content="https://mockintosh.com/og.png" />

        <title>{title}</title>
      </Head>
      {/* <audio ref={audio} src="sesound.mp3" preload="auto" /> */}

      <div className="flex justify-center items-center min-h-screen">
        <div
          style={{ width: 512, height: 342, transform: `scale(${zoom})` }}
          className="flex corner flex-col relative"
        >
          {showingSplashscreen && (
            <div
              className="absolute z-50 corner top-0 bottom-0 right-0 left-0 flex items-center justify-center"
              onClick={() => setSplashScreen(false)}
            >
              <img src="/icons/happy.png" />
            </div>
          )}
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
                  {/* <h1 className="font-chicago">Pluto</h1> */}
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
          {/* Windows */}
          <div className="flex-grow relative">
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
                      scale={zoom}
                      resizable
                    >
                      <div className="p-5 flex">
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
                      scale={zoom}
                      resizable
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
                      // width={256}
                      scale={zoom}
                    >
                      <PhotoBooth active={i === window.length - 1} />
                    </Window>
                  );
                case windowTypes.ABOUT_THIS_MOCKINTOSH:
                  return (
                    <Window
                      key={window.title}
                      window={window}
                      closeWindow={closeWindow}
                      bringWindowToFront={bringWindowToFront}
                      active={i === openWindows.length - 1}
                      scale={zoom}
                      width={350}
                    >
                      <AboutThisMockintosh />
                    </Window>
                  );
              }
            })}

            {/* Icons */}
            <div className="">
              {/* flex justify-end py-3 px-2 */}
              <div className="grid grid-cols-icons grid-rows-icons grid-flow-col gap-2 m-2">
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

          {/* put it here */}
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
    props: { initialWindows, icons, version },
  };
}
