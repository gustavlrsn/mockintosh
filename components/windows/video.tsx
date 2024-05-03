import React, { useRef, useState, useEffect } from "react";
//import Button from "@/components/button";
import Dither from "canvas-dither";
import { Window } from "../ui/window";
// add video of Susan Kare explaining the Macintosh icons
// https://www.youtube.com/watch?v=x_q50tvbQm4
// https://www.youtube.com/watch?v=ZmWOtf4Ziso
// https://archive.org/details/Computer1984_3?start=926

// am i doing this correctly?: https://stackoverflow.com/questions/57320960/correct-handling-of-react-hooks-for-streaming-video-camera-to-html-video-element
export default function Video({ setFullScreen, isFullscreen, window, i }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  // const width = 512;
  // const height = 240;

  const [dimensions, setDimensions] = useState({
    width: 340,
    height: 240,
  });

  useEffect(() => {
    if (video.current && canvas.current) {
      console.log("setting ctx");
      setCtx(
        canvas.current.getContext("2d", {
          willReadFrequently: true,
          desynchronized: true,
          alpha: false,
        })
      );
      video.current.addEventListener(
        "play",
        () => {
          timerCallback();
        },
        false
      );
      video.current.addEventListener(
        "canplay",
        () => {
          video.current?.play();
          computeFrame();
          // this.video.classList.add('show-on-hover')
        },
        false
      );
    }
    return () => {};
  }, [video.current, canvas.current]);

  function timerCallback() {
    if (video.current?.paused || video.current?.ended) {
      return;
    }
    computeFrame();
    setTimeout(() => {
      timerCallback();
    }, 0);
  }

  function computeFrame() {
    if (ctx && video.current && canvas.current) {
      const videoRatio = video.current.videoWidth / video.current.videoHeight;

      // const newWidth = dimensions.width;
      const newHeight = Math.floor(dimensions.width / videoRatio);

      //console.log({ videoRatio, newHeight, dimensions });
      video.current.setAttribute("width", dimensions.width.toString());
      video.current.setAttribute("height", newHeight.toString());

      canvas.current.width = dimensions.width;
      canvas.current.height = newHeight;

      ctx.drawImage(video.current, 0, 0, dimensions.width, newHeight);
      let pixels = ctx.getImageData(0, 0, dimensions.width, newHeight);
      pixels = Dither.atkinson(pixels);
      //pixels = Dither.bayer(pixels, 135);
      ctx.putImageData(pixels, 0, 0);
    }
  }

  // function paintToCanvas() {
  //   setLoading(false);
  //   if (video.current && canvas.current) {
  //     const videoRatio = video.current.videoWidth / video.current.videoHeight;

  //     // const newWidth = dimensions.width;
  //     const newHeight = dimensions.width / videoRatio;
  //     setDimensions({ width: dimensions.width, height: newHeight });

  //     video.current.setAttribute("width", dimensions.width.toString());
  //     video.current.setAttribute("height", newHeight.toString());

  //     canvas.current.width = dimensions.width;
  //     canvas.current.height = newHeight;

  //     const ctx = canvas.current.getContext("2d");

  //     const interval = setInterval(() => {
  //       if (!video.current) {
  //         clearInterval(interval);
  //       } else if (ctx) {
  //         ctx.drawImage(video.current, 0, 0, dimensions.width, newHeight);
  //         let pixels = ctx.getImageData(0, 0, dimensions.width, newHeight);
  //         pixels = Dither.atkinson(pixels);
  //         //pixels = Dither.bayer(pixels, 135);
  //         ctx.putImageData(pixels, 0, 0);
  //       }
  //     }, 33);
  //   }
  // }

  // Take screenshot?
  // function takePhoto() {
  //   //snap.currentTIme = 0;
  //   //snap.play();a
  //   const time = Date.now();
  //   const full = canvas.current.toDataURL("image/png");
  //   setPhotos([{ full, time }, ...photos]);
  //   setViewingPhoto(0);
  // }
  // useEffect(() => {
  //   if (video.current) {
  //     if (video.current.paused) {
  //       setIsPlaying(false);
  //     } else {
  //       setIsPlaying(true);
  //     }
  //   } else {
  //     setIsPlaying(false);
  //   }
  // }, [video.current?.paused]);
  // useEffect(() => {
  //   if (video.current) {
  //     video.current.play();
  //     video.current.addEventListener("canplay", paintToCanvas);
  //   }

  //   return () => {
  //     video.current?.removeEventListener("canplay", paintToCanvas);
  //   };
  // }, []);

  console.log({ isPlaying, paused: video.current?.paused });

  return (
    <Window i={i} {...window} width={340}>
      <div className="relative">
        <div className="relative">
          {/* {loading && (
          <div className="absolute inset-0 flex items-center justify-center cursor-loading font-chicago">
            Loading video...
          </div>
        )} */}

          <canvas ref={canvas} className="" />
          <div className="absolute bottom-1 right-0 left-0 flex gap-2 px-2">
            <button
              className="border-black flex-shrink-0 border bg-white focus:outline-none font-chicago active:invert active:border-white h-4 w-4 flex items-center justify-center"
              onClick={() => {
                if (video.current?.paused) {
                  video.current.play();
                  setIsPlaying(true);
                } else {
                  video?.current?.pause();
                  setIsPlaying(false);
                }
              }}
            >
              {!isPlaying ? <img src="/play.png" /> : <img src="/pause.png" />}
            </button>
            <div className="h-4 flex-1 border border-black flex">
              <button className="focus:outline-none border-r border-black bg-white">
                <img src="/arrow-left.png" />
              </button>
              <div className="bg-scroll h-full relative flex flex-1 ">
                <button className="bg-white border m-0 border-black h-[14px] w-[14px]"></button>
              </div>
              <button className="focus:outline-none border-l border-black bg-white">
                <img src="/arrow-right.png" />
              </button>
            </div>
          </div>
        </div>
        <video ref={video} className="hidden" src="/1984.mp4" />
      </div>
    </Window>
  );
}
