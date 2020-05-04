import Head from "next/head";
import { useState } from "react";
import Window from "../components/window";
import File from "../components/file";
import { getFileContent } from "../lib/api";

export default ({ initialWindows }) => {
  const [windows, setOpenWindows] = useState(initialWindows);

  const closeWindow = (id) =>
    setOpenWindows([...windows.filter((window) => window.id !== id)]);

  const setActiveWindow = (id) => {
    if (windows[windows.length - 1].id !== id)
      setOpenWindows([
        ...windows.sort((a, b) => {
          if (a.id === id) return 1;
          if (b.id === id) return -1;
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
      <div className="flex flex-col min-h-screen">
        <div className="corner bg-white px-4 h-5 border-b border-black flex items-stretch justify-between">
          <div className="flex items-center">
            <img
              src="/filledcircle.svg"
              className="mr-2"
              style={{ height: 11, width: 11 }}
            />
            <h1 className="font-chicago">Pluto</h1>
          </div>
          <a
            className="block flex items-center px-1 font-chicago active:bg-black active:text-white"
            target="_blank"
            href="https://github.com/plutocomputerclub/pluto"
          >
            Source
          </a>
        </div>
        <div className="flex-grow">
          {windows.map((window, i) => {
            switch (window.type) {
              case "FILE":
                return (
                  <Window
                    title={window.id}
                    key={window.id}
                    defaultPosition={window.defaultPosition}
                    close={() => closeWindow(window.id)}
                    setActive={() => setActiveWindow(window.id)}
                    active={i === windows.length - 1}
                  >
                    <File content={window.content} />
                  </Window>
                );
            }
          })}
        </div>
      </div>
    </>
  );
};

export async function getStaticProps() {
  const initialWindows = [
    {
      id: "CONTRIBUTING.md",
      type: "FILE",
      defaultPosition: { x: 750, y: 400 },
      content: await getFileContent("CONTRIBUTING.md"),
    },
    {
      id: "todo.md",
      type: "FILE",
      defaultPosition: { x: 420, y: 100 },
      content: await getFileContent("todo.md"),
    },
    {
      id: "README.md",
      type: "FILE",
      defaultPosition: { x: 75, y: 65 },
      content: await getFileContent("README.md"),
    },
  ];

  return {
    props: { initialWindows },
  };
}
