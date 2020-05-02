import Head from "next/head";
import { useState } from "react";
import Window from "../components/window";
import File from "../components/file";
import { getFileContent } from "../lib/api";

export default ({ openWindows }) => {
  const [windows, setOpenWindows] = useState(openWindows);

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
        <title>Pluto Computer Club</title>
      </Head>
      <div className="flex flex-col min-h-screen">
        <div
          className="corner bg-white px-5 border-b border-black flex items-center "
          style={{ height: 19 }}
        >
          <img
            src="/filledcircle.svg"
            className="mr-2"
            style={{ height: 11, width: 11 }}
          />
          <h1 className="font-chicago">Pluto</h1>
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
                    onClick={() => setActiveWindow(window.id)}
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
  const openWindows = [
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
    props: { openWindows },
  };
}
