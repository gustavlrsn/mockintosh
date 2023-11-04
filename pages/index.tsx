import React, { useState, useEffect } from "react";
import store from "store";
// import { DndContext } from "@dnd-kit/core";
import { Window } from "@/components/ui/window";
import Head from "@/components/head";
import { getFileContent } from "@/lib/api";
import PhotoBooth from "@/components/windows/photobooth";
import Finder from "@/components/windows/folder";
import File from "@/components/windows/file";
// import Draw from "@/components/windows/draw";
import AboutThisMockintosh from "@/components/windows/about";
import { SystemMenubar } from "@/components/menubar";
import Splashscreen from "@/components/splashscreen";
import Desktop from "@/components/desktop";
import Screen from "@/components/screen";
import Icon from "@/components/icon";
//import ChooseUsernamePopup from "@/components/chooseUsername";
import Video from "@/components/windows/video";
import getDefaultPosition from "@/utils/getDefaultPosition";
import pkg from "@/package.json";
import Safari from "@/components/windows/safari";
import useWindowSize from "@/lib/hooks/useWindowSize";
import { getZoomLevel } from "@/lib/utils";
import { resolution } from "@/lib/config";
import clsx from "clsx";
import FPSStats from "react-fps-stats";

const version = pkg.version;
const simulatedBootTime = 1337;

const fileTypes = {
  FINDER: "FINDER",
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  CHAT: "CHAT",
  PHOTO_BOOTH: "PHOTO_BOOTH",
};

export const applicationTypes = {
  PHOTO_BOOTH: "PHOTO_BOOTH",
  FILE: "FILE",
  FINDER: "FINDER",
  ABOUT_THIS_MOCKINTOSH: "ABOUT_THIS_MOCKINTOSH", // borde bara vara definierat direkt någon
  // CHAT: "CHAT",
  VIDEO: "VIDEO",
  SAFARI: "SAFARI",
  DRAW: "DRAW",
  //MOCKINGRAM: "MOCKINGRAM",
};

export const APP_TYPES = {
  PHOTO_BOOTH: "PHOTO_BOOTH",
  CHAT: "CHAT",
};

export const SystemContext = React.createContext({
  closeWindow: (title: string) => null,
  bringWindowToFront: (title: string) => null,
  zoom: 1,
  openWindows: [],
  width: resolution.width,
  height: resolution.height,
});

const Index = ({ initialApplications, files }) => {
  const [showingSplashscreen, setSplashScreen] = useState(true);
  const [settings, setSettings] = useState({ showMac: true });
  const { width, height } = useWindowSize();
  const zoom = getZoomLevel({ width, height });

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

  const [openApplications, setOpenApplications] = useState(initialApplications);

  const closeWindow = (title) => {
    console.log("IN FN: closing window w title:", title);
    const newApplications = openApplications.filter(
      (window) => window.title !== title
    );
    console.log({ oldApplications: openApplications, newApplications });
    setOpenApplications(newApplications);
  };

  const openWindow = (window) => {
    const windowIsOpen = Boolean(
      openApplications.find((openWindow) => openWindow.title === window.title)
    );

    if (windowIsOpen) {
      bringWindowToFront(window.title);
    } else {
      const defaultPosition = getDefaultPosition(openApplications);

      setOpenApplications([
        ...openApplications,
        { defaultPosition, ...window },
      ]);
    }
  };

  const bringWindowToFront = (title) => {
    if (
      openApplications.length &&
      openApplications[openApplications.length - 1].title !== title
    )
      setOpenApplications([
        ...openApplications.sort((a, b) => {
          if (a.title === title) return 1;
          if (b.title === title) return -1;
          return 0;
        }),
      ]);
  };

  return (
    <>
      <Head />
      {/* <audio ref={audio} src="sesound.mp3" preload="auto" /> */}
      <FPSStats />

      <SystemContext.Provider
        value={{
          closeWindow,
          bringWindowToFront,
          openWindows: openApplications,
          zoom,
        }}
      >
        <div
          className={clsx(
            "flex justify-center items-center min-h-screen"
            // cursor({ zoom, type: "default" })
          )}
        >
          <Screen width={resolution.width} height={resolution.height}>
            {showingSplashscreen && (
              <Splashscreen onClick={() => setSplashScreen(false)} />
            )}
            <SystemMenubar openWindow={openWindow} />

            {/* <DndContext> */}
            {/* Windows */}
            <div className="flex-grow flex">
              {openApplications.map((window, i) => {
                switch (window.type) {
                  case applicationTypes.FINDER:
                    return (
                      <Finder
                        key={window.title}
                        i={i}
                        {...window.payload}
                        path={window.path}
                        openWindow={openWindow}
                        window={window}
                      />
                    );
                  case applicationTypes.FILE:
                    return (
                      <File
                        key={window.title}
                        {...window.payload}
                        window={window}
                        i={i}
                      />
                    );
                  case applicationTypes.PHOTO_BOOTH:
                    return (
                      <PhotoBooth
                        key={window.title}
                        i={i}
                        {...window.payload}
                        window={window}
                      />
                    );
                  case applicationTypes.ABOUT_THIS_MOCKINTOSH:
                    return <AboutThisMockintosh window={window} i={i} />;
                  case applicationTypes.VIDEO:
                    return <Video {...window.payload} window={window} i={i} />;
                  case applicationTypes.SAFARI:
                    return (
                      <Safari
                        key={window.title}
                        i={i}
                        {...window.payload}
                        window={window}
                      />
                    );
                }
              })}

              <Desktop openWindow={openWindow} openWindows={openApplications}>
                {files.map((file) => (
                  <Icon
                    //path={`/${file.title}`}
                    key={file.title}
                    icon={file}
                    openWindow={openWindow}
                  />
                ))}
              </Desktop>
            </div>
            {/* </DndContext> */}
          </Screen>
        </div>
      </SystemContext.Provider>
    </>
  );
};

export async function getStaticProps() {
  const initialApplications = [];

  // const filesystem = [
  //   { path: "/Mockintosh HD", icon: "/icons/hd.png", type: fileTypes.FINDER },
  //   {
  //     path: "/Mockintosh HD/Development",
  //     icon: "/icons/FINDER.png",
  //     type: fileTypes.FINDER,
  //   },
  //   {
  //     path: "/Mockintosh HD/Development/README.md",
  //     icon: "/icons/file.png",
  //     type: fileTypes.TEXT,
  //   },
  //   {
  //     path: "/Mockintosh HD/Development/CONTRIBUTING.md",
  //     icon: "/icons/file.png",
  //     type: fileTypes.TEXT,
  //   },
  //   {
  //     path: "/Mockintosh HD/Development/todo.md",
  //     icon: "/icons/file.png",
  //     type: fileTypes.TEXT,
  //   },
  //   {
  //     path: "/Photo Booth",
  //     icon: "/icons/1bitcamera.png",
  //     type: fileTypes.PHOTO_BOOTH,
  //   },
  //   { path: "/1984.mp4", icon: "/icons/MacFlim.png", type: fileTypes.VIDEO },
  // ];
  const files = [
    {
      title: "Mockintosh HD",
      type: applicationTypes.FINDER,
      img: "/icons/hd.png",
      payload: {
        icons: [
          {
            title: "Development",
            type: applicationTypes.FINDER,
            img: "/icons/folder.png",
            payload: {
              icons: [
                {
                  title: "README.md",
                  type: applicationTypes.FILE,
                  img: "/icons/file.png",
                  payload: {
                    content: await getFileContent("README.md"),
                  },
                },
                {
                  title: "CONTRIBUTING.md",
                  type: applicationTypes.FILE,
                  img: "/icons/file.png",
                  payload: {
                    content: await getFileContent("CONTRIBUTING.md"),
                  },
                },
                {
                  title: "todo.md",
                  type: applicationTypes.FILE,
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
      title: "Photo Booth",
      type: applicationTypes.PHOTO_BOOTH,
      img: "/icons/photobooth-smr-32.png",
      payload: {},
      menubar: [
        {
          label: "File",
          items: [
            { label: "Take Photo", action: "TAKE_PHOTO" },
            { label: "Start Recording", action: "START_RECORDING" },
            { label: "Stop Recording", action: "STOP_RECORDING" },
          ],
        },
        {
          label: "View",
          items: [
            {
              type: "radiogroup",
              items: [{ label: "288x288" }, { label: "320x320" }],
            },
          ],
        },
      ],
    },
    // {
    //   title: "App Store",
    //   type: applicationTypes.SAFARI,
    //   img: "/icons/appstore-smr-32x32.png",
    //   payload: {},
    // },
    {
      title: "1984.mp4",
      type: applicationTypes.VIDEO,
      img: "/icons/MacFlim.png",
      payload: {},
    },

    {
      title: "Safari",
      type: applicationTypes.SAFARI,
      img: "/icons/safari.png",
      payload: {},
    },
    // {
    //   title: "Draw",
    //   type: applicationTypes.DRAW,
    //   img: "/icons/safari.png",
    //   payload: {},
    // },

    // {
    //   title: "1-bitgram",
    //   type: applicationTypes.MOCKINGRAM,
    //   img: "/icons/film.png",
    // },
    // {
    //   title: "Chat",
    //   type: applicationTypes.CHAT,
    //   img: "/icons/chat.png",
    // },
  ];

  return {
    props: { initialApplications, files: files, version },
  };
}

export default Index;
