import { useState, useEffect } from "react";
import store from "store";
import { useSession } from "next-auth/client";

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
import ChooseUsernamePopup from "components/chooseUsername";

import getDefaultPosition from "utils/getDefaultPosition";
import { version } from "package.json";

const simulatedBootTime = 1337;

export const windowTypes = {
  PHOTO_BOOTH: "PHOTO_BOOTH",
  FILE: "FILE",
  FOLDER: "FOLDER",
  ABOUT_THIS_MOCKINTOSH: "ABOUT_THIS_MOCKINTOSH",
  CHAT: "CHAT",
  //MOCKINGRAM: "MOCKINGRAM",
};

const Index = ({ initialWindows, icons }) => {
  const [showingSplashscreen, setSplashScreen] = useState(true);
  const [settings, setSettings] = useState({ showMac: true });

  const [session, loading] = useSession();
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
      <WithGraphQL session={session}>
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

            <ChooseUsernamePopup currentUser={user} />
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
                        width={320}
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
                        width={350}
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
      </WithGraphQL>
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
      title: "Photo Booth",
      type: windowTypes.PHOTO_BOOTH,
      img: "/icons/camera.png",
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
    props: { initialWindows, icons, version },
  };
}

export default Index;
