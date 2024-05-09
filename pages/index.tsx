import React, { useState, useEffect } from "react";
import store from "store";
import clsx from "clsx";

import Head from "@/components/head";
import PhotoBooth from "@/components/photobooth/photobooth";
import Finder from "@/components/windows/folder";
import File from "@/components/windows/file";
import AboutThisMockintosh from "@/components/windows/about";
import { SystemMenubar } from "@/components/menubar";
import Splashscreen from "@/components/splashscreen";
import Desktop from "@/components/desktop";
import Screen from "@/components/screen";
import Icon from "@/components/icon";
import Video from "@/components/windows/video";
import Safari from "@/components/windows/safari";
import Picture from "@/components/windows/picture";
import { ControlPanel } from "@/components/windows/control-panel";

import { getFileContent } from "@/lib/api";
import useWindowSize from "@/lib/hooks/useWindowSize";
import { getZoomLevel } from "@/lib/utils";
import { resolution } from "@/lib/config";
import PixelFontCanvas from "@/lib/PixelFontCanvas";
import getDefaultPosition from "@/utils/getDefaultPosition";
import pkg from "@/package.json";

// import glyphs from "@/glyphs.json";

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
  ABOUT_THIS_MOCKINTOSH: "ABOUT_THIS_MOCKINTOSH",
  // CHAT: "CHAT",
  VIDEO: "VIDEO",
  SAFARI: "SAFARI",
  DRAW: "DRAW",
  CONTROL_PANEL: "CONTROL_PANEL",
  PICTURE: "PICTURE",
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
  openWindow: (window: any) => null,
  menubar: [],
  setMenubar: (menubar: MenubarType) => null,
  width: resolution.width,
  height: resolution.height,
});

type MenubarItemProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  shortcut?: string;
};

type MenubarRadioItemProps = {
  label: string;
  value: string;
  onClick?: () => void;
  disabled?: boolean;
};

type MenubarRadioGroup = {
  type: "radiogroup";
  value: string;
  onValueChange: (value: string) => void;
  items: MenubarRadioItemProps[];
};

export type MenubarType = {
  label: string;
  items: (MenubarRadioGroup | MenubarItemProps)[];
}[];

const finderMenubar: MenubarType = [
  {
    label: "File",
    items: [
      {
        label: "New Folder",
        shortcut: "⌘N",
        disabled: true,
      },
      {
        label: "Open",
        shortcut: "⌘O",
        disabled: true,
      },
      {
        label: "Print",
        disabled: true,
      },
      {
        label: "Close",
        disabled: true,
      },
    ],
  },
  {
    label: "Edit",
    items: [
      {
        label: "Undo",
        shortcut: "⌘Z",
        disabled: true,
      },
      {
        label: "Cut",
        shortcut: "⌘X",
        disabled: true,
      },
      {
        label: "Copy",
        shortcut: "⌘C",
        disabled: true,
      },
      {
        label: "Paste",
        shortcut: "⌘V",
        disabled: true,
      },
      {
        label: "Clear",
        disabled: true,
      },
      {
        label: "Select All",
        shortcut: "⌘A",
        disabled: true,
      },
      {
        label: "Show Clipboard",
        disabled: true,
      },
    ],
  },
  {
    label: "View",
    items: [
      {
        label: "By Small Icon",
        disabled: true,
      },
      {
        label: "By Icon",
        disabled: true,
      },
      {
        label: "By Name",
        disabled: true,
      },
      {
        label: "By Date",
        disabled: true,
      },
      {
        label: "By Size",
        disabled: true,
      },
      {
        label: "By Kind",
        disabled: true,
      },
    ],
  },
  {
    label: "Special",
    items: [
      {
        label: "Clean Up Desktop",
        disabled: true,
      },
      {
        label: "Empty Trash",
        disabled: true,
      },
      {
        label: "Erase Disk",
        disabled: true,
      },
      {
        label: "Set Startup...",
        disabled: true,
      },
      {
        label: "Restart",
        disabled: true,
      },
      {
        label: "Shut Down",
        disabled: true,
      },
    ],
  },
];

const Index = ({ initialApplications, files }) => {
  const [showingSplashscreen, setSplashScreen] = useState(true);
  const [settings, setSettings] = useState({ showMac: true });
  const { width, height } = useWindowSize();
  const [menubar, setMenubarState] = useState(finderMenubar);
  const setMenubar = (menubar) => {
    setMenubarState(menubar ?? finderMenubar);
  };

  // const charCodes = Object.keys(glyphs).map((key) => parseInt(key));
  // // const charCodesRedaction = Object.keys(glyphsRed).map((key) => parseInt(key));

  // const characters = charCodes.map((code) => String.fromCharCode(code));
  // console.log({ str: characters.join("") });

  const zoom = getZoomLevel({ width, height });
  useEffect(() => {
    Promise.all([
      PixelFontCanvas.loadFont("/fonts/", "Geneva9.fnt"),
      PixelFontCanvas.loadFont("/fonts/", "ChiKareGo.fnt"),
    ]).then(([geneva, chikarego]) => {
      setTimeout(() => setSplashScreen(false), simulatedBootTime);
    });

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
  const isDevelopment = process.env.NODE_ENV === "development";
  return (
    <>
      <Head />
      {/* <audio ref={audio} src="sesound.mp3" preload="auto" /> */}
      <SystemContext.Provider
        value={{
          closeWindow,
          bringWindowToFront,
          openWindows: openApplications,
          openWindow: openWindow,
          setMenubar,
          menubar,
          zoom,
          width,
          height,
        }}
      >
        <div
          className={clsx(
            "flex justify-center items-center min-h-screen"
            // cursor({ zoom, type: "default" })
          )}
        >
          <Screen width={resolution.width} height={resolution.height}>
            {showingSplashscreen ? (
              <Splashscreen onClick={() => setSplashScreen(false)} />
            ) : (
              <React.Fragment>
                <SystemMenubar />

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
                      case applicationTypes.PICTURE:
                        return (
                          <Picture
                            key={window.title}
                            i={i}
                            {...window.payload}
                            window={window}
                          />
                        );
                      case applicationTypes.ABOUT_THIS_MOCKINTOSH:
                        return <AboutThisMockintosh window={window} i={i} />;
                      case applicationTypes.CONTROL_PANEL:
                        return <ControlPanel window={window} i={i} />;
                      case applicationTypes.VIDEO:
                        return (
                          <Video {...window.payload} window={window} i={i} />
                        );
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

                  <Desktop
                    openWindow={openWindow}
                    openWindows={openApplications}
                  >
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
              </React.Fragment>
            )}
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
      defaultPosition: {
        y: 5,
        x: 45,
      },
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

    // {
    //   title: "pic.png",
    //   type: applicationTypes.PICTURE,
    //   img: "/icons/MacFlim.png",
    //   payload: { width: 236, height: 235, src: "/images/mockintosh.png" },
    // },

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
