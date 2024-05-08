import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Dither from "canvas-dither";
// import { useWorker } from "@koale/useworker";

import {
  connectClickHandler,
  printClickHandler,
  printFourPortrait,
  printPanorama,
  printPortrait,
} from "@/lib/print";
import { Window } from "@/components/ui/window";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import SystemButton from "@/components/button";
import PixelFontCanvas from "@/lib/PixelFontCanvas";
import { MenubarType, SystemContext } from "@/pages";
import { write } from "opfs-tools";
import dayjs from "dayjs";
// import { Photoroll } from "../photobooth/photoroll";
// import { encode1bitImageData, encodeImageData } from "@/lib/image";

const getMenubar = ({
  ditheringAlgorithm,
  setDitheringAlgorithm,
}): MenubarType => {
  return [
    {
      label: "File",
      items: [
        { label: "Take Photo" },
        { label: "Start Recording" },
        { label: "Stop Recording" },
      ],
    },
    {
      label: "View",
      items: [
        {
          type: "radiogroup",
          value: "288x288",
          onValueChange: (value) => {
            console.log("value", value);
          },
          items: [
            { label: "288x288", value: "288x288" },
            { label: "320x320", value: "320x320" },
          ],
        },
      ],
    },
    {
      label: "Dithering",
      items: [
        {
          type: "radiogroup",
          value: ditheringAlgorithm,
          onValueChange: (value) => {
            setDitheringAlgorithm(value);
          },
          items: [
            { label: "Atkinson", value: "atkinson" },
            { label: "Bayer", value: "bayer" },
          ],
        },
      ],
    },
  ];
};

export default function Photobooth({ i, window }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const beep = new Audio("/sound/beep.wav");
  const click = new Audio("/sound/click.wav");
  const { setMenubar } = React.useContext(SystemContext);
  const [photos, setPhotos] = useState([]);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [flash, setFlash] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [ditheringAlgorithm, setDitheringAlgorithm] =
    React.useState("atkinson");

  useEffect(() => {
    const menubar = getMenubar({
      ditheringAlgorithm,
      setDitheringAlgorithm,
    });

    setMenubar(menubar);
  }, [ditheringAlgorithm]);

  useEffect(() => {
    // PixelFontCanvas.loadFont("/fonts/", "Redaction20-Regular.fnt", (data) => {
    //   setFontLoaded(true);
    // });
    PixelFontCanvas.loadFont("/fonts/", "Redaction35-Regular.fnt", (data) =>
      console.log("Font loaded", data)
    );
  }, []);
  useEffect(() => {
    if (flash) {
      const timerId = setTimeout(() => {
        setFlash(false);
      }, 300);

      return () => clearTimeout(timerId); // This will clear the timeout if the component unmounts before the timeout finishes
    }
  }, [flash]);

  const deletePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));

    setViewingPhoto(null);
  };
  const [countdown, setCountdown] = useState(undefined);
  useEffect(() => {
    if (countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      beep.play();
      // Play beep sound here
      // Update UI to show countdown

      return () => clearTimeout(timerId); // This will clear the timeout if the component unmounts before the timeout finishes
    } else if (countdown === 0) {
      click.play();
      takePhoto();
    }
  }, [countdown]);

  function startCountdown() {
    setCountdown(3);
  }
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const width = 288; // 412; //320 for new printer
  const height = 288; ///288; //320vg

  // const width = 360;
  // const height = 270;
  function getVideo() {
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      devices.forEach(function (device) {
        console.log({
          device,
          id: device.deviceId,
          json: device.toJSON(),
          label: device.label,
          kind: device.kind,
        });
      });
    });
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((localMediaStream) => {
        video.current.srcObject = localMediaStream;
        video.current.play();
        console.log({
          videoHeight: video.current.videoHeight,
          videoWidth: video.current.videoWidth,
        });
      })
      .catch((err) => {
        setErrorText(err.message);
        console.log(err);
        setLoading(false);
      });
  }

  function paintToCanvas() {
    setLoading(false);
    // console.log({
    //   videoHeight: video.current.videoHeight,
    //   videoWidth: video.current.videoWidth,
    // });
    const offscreen = new OffscreenCanvas(width, height);
    const offscreenCtx = offscreen.getContext("2d");

    const originalVideoHeight = video.current.videoHeight;
    const originalVideoWidth = video.current.videoWidth;
    console.log({
      originalVideoHeight,
      originalVideoWidth,
    });
    // video.current.setAttribute("width", width);
    // video.current.setAttribute("height", width);
    const useOffScreenCavanvas = "OffscreenCanvas" in window && false;
    const canvasEl = useOffScreenCavanvas
      ? canvas.current // .transferControlToOffscreen()
      : canvas.current;
    canvasEl.width = width;
    canvasEl.height = height;

    const ctx = canvasEl.getContext("2d", {
      willReadFrequently: true,
    });

    const videoAspectRatio = originalVideoWidth / originalVideoHeight;
    const canvasAspectRatio = width / height;

    let sx = 0;
    let sy = 0;
    let swidth = originalVideoWidth;
    let sheight = originalVideoHeight;

    if (videoAspectRatio > canvasAspectRatio) {
      // Video is wider than canvas
      const scaledWidth = originalVideoHeight * canvasAspectRatio;
      sx = (originalVideoWidth - scaledWidth) / 2;
      swidth = scaledWidth;
    } else {
      // Video is taller than canvas
      const scaledHeight = originalVideoWidth / canvasAspectRatio;
      sy = (originalVideoHeight - scaledHeight) / 2;
      sheight = scaledHeight;
    }

    const draw = async () => {
      try {
        console.time("wCreateImageBitmap");
        const bitmap = await createImageBitmap(
          video.current,
          sx,
          sy,
          swidth,
          sheight
        );
        offscreenCtx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();
        let pixels = offscreenCtx.getImageData(0, 0, width, height);
        pixels = Dither[ditheringAlgorithm](pixels, 120);
        ctx.putImageData(pixels, 0, 0);
        console.timeEnd("wCreateImageBitmap");
      } catch (err) {
        console.error("Error creating ImageBitmap:", err);
      }
    };

    const interval = setInterval(() => {
      if (!video.current) {
        clearInterval(interval);
      } else {
        draw();
      }
    }, 64);
  }

  function takePhoto() {
    if (countdown !== 0) {
      return;
    }
    setFlash(true);
    setCountdown(undefined);

    setTimeout(async () => {
      //snap.currentTIme = 0;
      //snap.play();a
      const time = Date.now();
      const date = dayjs(time).format("YYYY-MM-DD HH:mm:ss");
      const currentCanvas = canvas.current;
      // currentCanvas.toBlob(async (blob) => {
      //   console.log({ time, blob });
      //   await write(`Mockintosh HD/Photo Booth/${date}.png`, blob.stream()); // empty file
      // });
      const full = currentCanvas.toDataURL("image/png");
      const canvasContext = currentCanvas.getContext("2d");
      const imageData = canvasContext.getImageData(
        0,
        0,
        currentCanvas.width,
        currentCanvas.height
      );
      // const encodedData = encodeImageData(imageData);
      // const encodedBlob = new Blob([encodedData], {
      //   type: "application/octet-stream",
      // });

      // await write(
      //   `Mockintosh HD/Photo Booth/${date}-2bit.pic`,
      //   encodedBlob.stream()
      // ); // empty file

      // const encoded1bit = encode1bitImageData(imageData);
      // const encoded1bitblob = new Blob([encoded1bit], {
      //   type: "application/octet-stream",
      // });

      // await write(
      //   `Mockintosh HD/Photo Booth/${date}-1bit.pic`,
      //   encoded1bitblob.stream()
      // ); // empty file

      // const blobbyDataUrl = new Blob([full]);

      // await write(
      //   `Mockintosh HD/Photo Booth/${date}-dataurl.pic`,
      //   blobbyDataUrl.stream()
      // ); // empty file
      setPhotos([{ full, time, imageData, canvasContext }, ...photos]);
      setViewingPhoto(0);
    }, 300);
  }

  useEffect(() => {
    getVideo();

    video.current.addEventListener("canplay", paintToCanvas);
    return () => {
      video.current?.removeEventListener("canplay", paintToCanvas);
      if (video.current?.srcObject) {
        const tracks = (video.current.srcObject as MediaStream).getTracks();
        tracks.forEach(function (track) {
          track.stop();
        });
        video.current.srcObject = null;
      }
    };
  }, []);
  console.log({ window });
  return (
    <React.Fragment>
      <Window
        i={i}
        width={width}
        title="Photo Booth"
        defaultPosition={window.defaultPosition}
      >
        <div className="relative">
          <div className="relative" style={{ height }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center cursor-loading font-chicago">
                {/* <img src="/icons/watch.png" /> */}
                Initializing camera...
              </div>
            )}
            {errorText && (
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="font-chicago">{errorText}</h1>
              </div>
            )}
            <canvas
              ref={canvas}
              // className="w-[412px]"bqz
              style={{
                transform: "scaleX(-1)",
                //height: "300px",
                // objectFit: "cover",
              }}
            />

            {viewingPhoto !== null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={photos[viewingPhoto].full} />
              </div>
            )}
            <div className="absolute bottom-0 right-0 left-0 flex items-center justify-center py-2">
              {viewingPhoto == null ? (
                <>
                  <Button
                    onClick={startCountdown}
                    disabled={loading || !!errorText}
                    className="p-0 h-10 w-10 flex items-center justify-center"
                  >
                    {countdown ? (
                      countdown
                    ) : (
                      <img
                        src="/photobooth/camera.png"
                        height={32}
                        width={32}
                      />
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {/* <Button className="mx-1" onClick={connectClickHandler}>
                Connect
              </Button> */}
                  <Button
                    className="mx-1 p-1"
                    onClick={(e) => {
                      setPrintDialogOpen(true);
                    }}
                  >
                    Print
                  </Button>
                  {/* <Button
                className="mx-1"
                onClick={(e) => {
                  const { imageData } = photos[0];
                  console.log("in click handler");
                  //console.log({ canvasData });
                  const ascii = asciiDither(imageData);
                  const currentCanvas = canvas.current;
                  const canvasContext = currentCanvas.getContext("2d");
                  canvasContext.putImageData(ascii, 0, 0);
                  const full = currentCanvas.toDataURL("image/png");

                  setPhotos([
                    { ...photos[0], imageData: ascii, full },
                    ...photos.slice(1),
                  ]);
                }}
              >
                Ascii
              </Button> */}
                  <Button
                    className="mx-1 p-1"
                    onClick={() => deletePhoto(viewingPhoto)}
                  >
                    Delete
                  </Button>
                  {/* <Button
                    className="mx-1 p-1"
                    onClick={() => setViewingPhoto(null)}
                  >
                    Hide
                  </Button> */}
                  <Button
                    className="mx-1 p-1"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = photos[viewingPhoto].full;
                      link.download = `mockintosh-photobooth-${photos[viewingPhoto].time}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    // href={photos[viewingPhoto].full}
                    // download={`mockintosh-photobooth-${photos[viewingPhoto].time}`}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={async () => {
                      await write("/dir/file.txt", ""); // empty file
                    }}
                  >
                    Local save
                  </Button>
                </>
              )}
            </div>
          </div>
          <video ref={video} className="hidden object-cover object-center " />

          {/* <div className="max-w-full overflow-x-scroll scroll border-t border-black">
        <div className="flex py-1 " style={{ height: "55px" }}>
          {photos.map(({ thumbnail, time }, i) => (
            <button
              key={time}
              onClick={() => setViewingPhoto(i)}
              className={`flex-none ml-1 focus:outline-none border-black border `}
              style={
                viewingPhoto === i
                  ? { outline: "2px solid black" }
                  : { outline: "0" }
              }
            >
              <img className="" src={thumbnail} />
            </button>
          ))}
          {/* <button href={full} download={`mockintosh-photobooth-${time}`}> */}
          {/* </div>
      </div> */}
        </div>
      </Window>
      {/* <Photoroll /> */}
      {flash && <div className="absolute inset-0 bg-white z-40"></div>}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent>
          <div className="space-y-3">
            <div className="font-chicago">Print with caption?</div>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2 items-center justify-end">
              <SystemButton onClick={() => setPrintDialogOpen(false)}>
                Cancel
              </SystemButton>
              <SystemButton
                onClick={() => {
                  const { imageData } = photos[0];
                  console.log("in click handler");
                  //console.log({ canvasData });
                  // printClickHandler(imageData, { caption });
                  printClickHandler(imageData, { caption });
                }}
              >
                Print
              </SystemButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
