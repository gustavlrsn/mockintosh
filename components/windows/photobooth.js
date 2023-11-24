import { useRef, useState, useEffect } from "react";
import Button from "components/button";
import Dither from "canvas-dither";
import { connectClickHandler, printClickHandler } from "lib/print";
import { asciiDither } from "lib/ascii-dither";

export default function Photobooth({}) {
  const canvas = useRef(null);
  const video = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const deletePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));

    setViewingPhoto(null);
  };

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const width = 288;
  const height = 288;

  // const width = 360;
  // const height = 270;
  function getVideo() {
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
        setLoading(false);
      });
  }

  function paintToCanvas() {
    setLoading(false);
    // console.log({
    //   videoHeight: video.current.videoHeight,
    //   videoWidth: video.current.videoWidth,
    // });

    const originalVideoHeight = video.current.videoHeight;
    const originalVideoWidth = video.current.videoWidth;
    console.log({
      originalVideoHeight,
      originalVideoWidth,
    });
    // video.current.setAttribute("width", width);
    // video.current.setAttribute("height", width);

    canvas.current.width = width;
    canvas.current.height = height;

    const ctx = canvas.current.getContext("2d");

    const sx = (originalVideoWidth - originalVideoHeight) / 2;
    const sy = 0; // (originalVideoHeight - originalVideoWidth) / 2 > 0 ? (originalVideoHeight - originalVideoWidth) / 2 : 0;
    const swidth = originalVideoHeight; // shortest of og width and height
    const sheight = originalVideoHeight; // shortest of og width and height
    const dx = 0; // 0px
    const dy = 0; // 0px
    const dWidth = width;
    const dHeight = height;

    const interval = setInterval(() => {
      if (!video.current) {
        clearInterval(interval);
      } else {
        ctx.drawImage(
          video.current,
          sx, // The x-axis coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context. Use the 3- or 5-argument syntax to omit this argument.
          sy, // The y-axis coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context. Use the 3- or 5-argument syntax to omit this argument.
          swidth, // The width of the sub-rectangle of the source image to draw into the destination context. If not specified, the entire rectangle from the coordinates specified by sx and sy to the bottom-right corner of the image is used. Use the 3- or 5-argument syntax to omit this argument. A negative value will flip the image.
          sheight, // The height of the sub-rectangle of the source image to draw into the destination context. Use the 3- or 5-argument syntax to omit this argument. A negative value will flip the image.
          dx, // The x-axis coordinate in the destination canvas at which to place the top-left corner of the source image.
          dy, // The y-axis coordinate in the destination canvas at which to place the top-left corner of the source image.
          dWidth, // The width to draw the image in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in width when drawn. Note that this argument is not included in the 3-argument syntax.
          dHeight // The height to draw the image in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in height when drawn. Note that this argument is not included in the 3-argument syntax.
        );

        let pixels = ctx.getImageData(0, 0, width, height);
        pixels = Dither.atkinson(pixels);
        //pixels = Dither.bayer(pixels, 135);
        ctx.putImageData(pixels, 0, 0);
      }
    }, 64);
  }

  function takePhoto() {
    //snap.currentTIme = 0;
    //snap.play();a
    const time = Date.now();
    const currentCanvas = canvas.current;
    const full = currentCanvas.toDataURL("image/png");
    const canvasContext = currentCanvas.getContext("2d");
    const imageData = canvasContext.getImageData(
      0,
      0,
      currentCanvas.width,
      currentCanvas.height
    );

    console.log("take photo");
    console.log({
      canvasContext,
      imageData,
      width: currentCanvas.width,
      height: currentCanvas.height,
    });
    setPhotos([{ full, time, imageData, canvasContext }, ...photos]);
    setViewingPhoto(0);
  }

  useEffect(() => {
    getVideo();

    video.current.addEventListener("canplay", paintToCanvas);
    return () => {
      video.current.removeEventListener("canplay", paintToCanvas);
      if (video.current.srcObject) {
        const tracks = video.current.srcObject.getTracks();
        tracks.forEach(function (track) {
          track.stop();
        });
        video.current.srcObject = null;
      }
    };
  }, []);

  return (
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
          className=""
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
            <Button onClick={takePhoto} disabled={loading || errorText}>
              Take photo
            </Button>
          ) : (
            <>
              {/* <Button className="mx-1" onClick={connectClickHandler}>
                Connect
              </Button> */}
              <Button
                className="mx-1"
                onClick={(e) => {
                  const { imageData } = photos[0];
                  console.log("in click handler");
                  //console.log({ canvasData });
                  printClickHandler(imageData);
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
                className="mx-1"
                onClick={() => deletePhoto(viewingPhoto)}
              >
                Delete
              </Button>
              <Button
                className="mx-1"
                href={photos[viewingPhoto].full}
                download={`mockintosh-photobooth-${photos[viewingPhoto].time}`}
              >
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      <video
        ref={video}
        className="hidden object-cover object-center h-[288px] w-[288px]"
      />

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
  );
}
