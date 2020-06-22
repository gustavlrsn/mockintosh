import Head from "next/head";
import { useState, useEffect } from "react";
import store from "store";

import Window from "../components/window";
import { getFileContent } from "../lib/api";
import PhotoBooth from "../components/windows/photobooth";
import Folder from "../components/windows/folder";
import File from "../components/windows/file";
import AboutThisMockintosh from "../components/windows/about";
import Menubar from "../components/menubar";
import Splashscreen from "../components/splashscreen";
import Desktop from "../components/desktop";
import Screen from "../components/screen";
import Icon from "../components/icon";
import getDefaultPosition from "../utils/getDefaultPosition";
import { version } from "../package.json";

const simulatedBootTime = 1337;

export const windowTypes = {
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
        <title>Mockintosh</title>
        <meta property="og:image" content="https://mockintosh.com/og.png" />
        <meta property="og:title" content="Mockintosh" />
        <meta property="og:description" content="mock operating system" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mockintosh.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@gustavlrsn" />
        <meta name="twitter:title" content="Mockintosh" />
        <meta name="twitter:description" content="mock operating system" />
        <meta name="twitter:image" content="https://mockintosh.com/og.png" />
      </Head>
      {/* <audio ref={audio} src="sesound.mp3" preload="auto" /> */}

      <div className="flex justify-center items-center min-h-screen">
        <Screen width={512} height={342} zoom={settings.zoom}>
          {showingSplashscreen && (
            <Splashscreen onClick={() => setSplashScreen(false)} />
          )}

          <Menubar
            openWindow={openWindow}
            zoom={settings.zoom}
            setZoom={(zoom) => setSetting("zoom", zoom)}
          />

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
                      scale={settings.zoom}
                      resizable
                    >
                      <Folder
                        {...window.payload}
                        openWindow={openWindow}
                        openWindows={openWindows}
                      />
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
                      scale={settings.zoom}
                      resizable
                      width={350}
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
                      width={320}
                      scale={settings.zoom}
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
                      scale={settings.zoom}
                      width={350}
                    >
                      <AboutThisMockintosh />
                    </Window>
                  );
              }
            })}

            <Desktop>
              {icons.map((icon) => (
                <Icon
                  key={icon.title}
                  icon={icon}
                  openWindow={openWindow}
                  openWindows={openWindows}
                />
              ))}
            </Desktop>
          </div>
        </Screen>
      </div>
    </>
  );
};

export async function getStaticProps() {
  const initialWindows = [];

  const icons = [
    {
      title: "Mockintosh HD",
      type: windowTypes.FOLDER,
      img: "/icons/hd.png",
      payload: {
        icons: [
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
        ],
      },
    },
    {
      title: "Photo booth",
      type: windowTypes.PHOTO_BOOTH,
      img: "/icons/film.png",
      payload: {},
    },
    {
      title: "Trash",
      type: windowTypes.FOLDER,
      img: "/icons/trash.png",
      payload: {},
    },
  ];

  return {
    props: { initialWindows, icons, version },
  };
}
