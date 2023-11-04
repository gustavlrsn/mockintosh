import { useState, useEffect } from "react";
import store from "store";
// import { useSession } from "next-auth/client";
import { DndContext } from "@dnd-kit/core";
import Window from "components/window";
import Head from "components/head";
import { getFileContent } from "lib/api";
import WithGraphQL from "lib/withGraphQL";
import PhotoBooth from "components/windows/photobooth";
import Chat from "components/windows/chat";
import Folder from "components/windows/folder";
import File from "components/windows/file";
import AboutThisMockintosh from "components/windows/about";
import Menubar from "components/menubar";
import Splashscreen from "components/splashscreen";
import Desktop from "components/desktop";
import Screen from "components/screen";
import Icon from "components/icon";
//import ChooseUsernamePopup from "components/chooseUsername";
import Video from "components/windows/video";
import getDefaultPosition from "utils/getDefaultPosition";
import pkg from "package.json";
const version = pkg.version;
const simulatedBootTime = 1337;

const fileTypes = {
  FOLDER: "FOLDER",
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  CHAT: "CHAT",
  PHOTO_BOOTH: "PHOTO_BOOTH",
};

export const windowTypes = {
  PHOTO_BOOTH: "PHOTO_BOOTH",
  FILE: "FILE",
  FOLDER: "FOLDER",
  ABOUT_THIS_MOCKINTOSH: "ABOUT_THIS_MOCKINTOSH", // borde bara vara definierat direkt någon
  CHAT: "CHAT",
  VIDEO: "VIDEO",
  //MOCKINGRAM: "MOCKINGRAM",
};

export const APP_TYPES = {
  PHOTO_BOOTH: "PHOTO_BOOTH",
  CHAT: "CHAT",
};

const Index = ({ initialWindows, files }) => {
  const [showingSplashscreen, setSplashScreen] = useState(true);
  const [settings, setSettings] = useState({ showMac: true });
  console.log({ files });
  //const [session, loading] = useSession();
  const session = null;
  const user = session?.user;

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
      {/* <WithGraphQL session={session}> */}
      <Head />
      {/* <audio ref={audio} src="sesound.mp3" preload="auto" /> */}

      <div className="flex justify-center items-center min-h-screen">
        <Screen width={512} height={346} showMac={settings.showMac}>
          {showingSplashscreen && (
            <Splashscreen onClick={() => setSplashScreen(false)} />
          )}
          <Menubar
            openWindow={openWindow}
            showMac={settings.showMac}
            setShowMac={(showMac) => setSetting("showMac", showMac)}
            user={user}
          />
          <DndContext>
            {/* <ChooseUsernamePopup currentUser={user} /> */}
            {/* Windows */}
            <div className="flex-grow relative flex">
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
                        resizable
                      >
                        <Folder
                          {...window.payload}
                          path={window.path}
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
                        width={288}
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
                        width={343}
                      >
                        <AboutThisMockintosh />
                      </Window>
                    );
                  case windowTypes.CHAT:
                    return (
                      <Window
                        key={window.title}
                        window={window}
                        closeWindow={closeWindow}
                        bringWindowToFront={bringWindowToFront}
                        active={i === openWindows.length - 1}
                        width={300}
                      >
                        <Chat currentUser={user} />
                      </Window>
                    );
                  case windowTypes.VIDEO:
                    return (
                      <Window
                        key={window.title}
                        window={window}
                        closeWindow={closeWindow}
                        bringWindowToFront={bringWindowToFront}
                        active={i === openWindows.length - 1}
                        width={340}
                      >
                        <Video {...window.payload} />
                      </Window>
                    );
                  // case windowTypes.MOCKINGRAM:
                  //   return (
                  //     <Window
                  //       key={window.title}
                  //       window={window}
                  //       closeWindow={closeWindow}
                  //       bringWindowToFront={bringWindowToFront}
                  //       active={i === openWindows.length - 1}
                  //       scale={settings.zoom}
                  //       width={240}
                  //     >
                  //       <Chat />
                  //     </Window>
                  //   );
                }
              })}

              <Desktop openWindow={openWindow} openWindows={openWindows}>
                {files.map((file) => (
                  <Icon
                    //path={`/${file.title}`}
                    key={file.title}
                    icon={file}
                    openWindow={openWindow}
                    openWindows={openWindows}
                  />
                ))}
              </Desktop>
            </div>
          </DndContext>
        </Screen>
      </div>
      {/* </WithGraphQL> */}
    </>
  );
};

export async function getStaticProps() {
  const initialWindows = [];

  // types of objects:

  // Folder
  // File
  //// Text
  //// Image
  //// Video
  // Executable
  //// Photo Booth
  //// About this Mockintosh
  //// Chat
  //// Mockingram

  const filesystem = [
    { path: "/Mockintosh HD", icon: "/icons/hd.png", type: fileTypes.FOLDER },
    {
      path: "/Mockintosh HD/Development",
      icon: "/icons/folder.png",
      type: fileTypes.FOLDER,
    },
    {
      path: "/Mockintosh HD/Development/README.md",
      icon: "/icons/file.png",
      type: fileTypes.TEXT,
    },
    {
      path: "/Mockintosh HD/Development/CONTRIBUTING.md",
      icon: "/icons/file.png",
      type: fileTypes.TEXT,
    },
    {
      path: "/Mockintosh HD/Development/todo.md",
      icon: "/icons/file.png",
      type: fileTypes.TEXT,
    },
    {
      path: "/Photo Booth",
      icon: "/icons/camera.png",
      type: fileTypes.PHOTO_BOOTH,
    },
    { path: "/1984.mp4", icon: "/icons/MacFlim.png", type: fileTypes.VIDEO },
  ];
  const files = [
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
      title: "Photo Booth",
      type: windowTypes.PHOTO_BOOTH,
      img: "/icons/camera.png",
      payload: {},
    },
    {
      title: "1984.mp4",
      type: windowTypes.VIDEO,
      img: "/icons/MacFlim.png",
      payload: {},
    },
    // {
    //   title: "1-bitgram",
    //   type: windowTypes.MOCKINGRAM,
    //   img: "/icons/film.png",
    // },
    {
      title: "Chat",
      type: windowTypes.CHAT,
      img: "/icons/chat.png",
    },
  ];

  return {
    props: { initialWindows, files: files, version },
  };
}

export default Index;
