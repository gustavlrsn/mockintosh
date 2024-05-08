import React from "react";
import { Window } from "@/components/ui/window";
import { dir, file } from "opfs-tools";

export function Photoroll({}) {
  const [photos, setPhotos] = React.useState([]);

  React.useEffect(() => {
    dir("/Mockintosh HD/Photo Booth")
      .children()
      .then((children) => {
        children.forEach((child) => {
          console.log(child);
          console.log(child.name);
          const arrayBuffer = file(child.path)
            .arrayBuffer()
            .then((ab) => {
              console.log({ ab });
              const blob = new Blob([ab], { type: "image/png" });
              const url = URL.createObjectURL(blob);
              console.log(url);
              setPhotos((photos) => [
                ...photos,
                {
                  full: url,
                  thumb: url,
                  time: child.name,
                },
              ]);
            });
          const stream = file(child.path)
            .stream()
            .then((stream) => {
              console.log({ stream });
            });
        });
        console.log({ children });
      });
  }, []);
  console.log({ photos });
  return (
    <Window width={87}>
      <div className="flex flex-wrap gap-2 min-h-[70px]">
        {photos.map(({ full, time }, i) => (
          <button
            key={time}
            // onClick={() => setViewingPhoto(i)}
            className={`flex-none relative w-full focus:outline-none border-black border `}
            // style={
            //   viewingPhoto === i
            //     ? { outline: "2px solid black" }
            //     : { outline: "0" }
            // }
          >
            <img
              src="/photobooth/frame.png"
              className="w-[87px] h-[70px] absolute inset-0"
            />
            <img
              className="size-16 my-[3px] mx-auto w-[64px] h-[64px]"
              src={full}
            />
          </button>
        ))}
      </div>
    </Window>
  );
}
