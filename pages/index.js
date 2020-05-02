import Head from "next/head";
import { useState } from "react";
import File from "../components/File";
import { getFileContent } from "../lib/api";
import logMessageForHackers from "../lib/logMessageForHackers";

export default ({ openWindows }) => {
  const [windows, setOpenWindows] = useState(openWindows);
  const closeWindow = (id) =>
    setOpenWindows([...windows.filter((window) => window.id !== id)]);

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
          {windows.map((window) => {
            switch (window.type) {
              case "FILE":
                return (
                  <File
                    key={window.id}
                    title={window.id}
                    defaultPosition={window.defaultPosition}
                    content={window.content}
                    close={() => closeWindow(window.id)}
                  />
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
