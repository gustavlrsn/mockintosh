import { useRef, useState, useEffect } from "react";

export default ({}) => {
  const canvas = useRef(null);

  const video = useRef(null);
  const thumbnailCanvas = useRef(null);
  const thumbnailVideo = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const deletePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));

    setViewingPhoto(null);
  };

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const width = 320;
  const height = 240;

  const thumbnailWidth = 60;
  const thumbnailHeight = 45;

  function getVideo() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((localMediaStream) => {
        video.current.srcObject = localMediaStream;
        video.current.play();

        thumbnailVideo.current.srcObject = localMediaStream;
        thumbnailVideo.current.play();
      })
      .catch((err) => {
        setErrorText(err.message);
        setLoading(false);
      });
  }

  function paintToCanvas() {
    setLoading(false);
    video.current.setAttribute("width", width);
    video.current.setAttribute("height", width);

    thumbnailVideo.current.setAttribute("width", thumbnailWidth);
    thumbnailVideo.current.setAttribute("height", thumbnailHeight);

    canvas.current.width = width;
    canvas.current.height = height;

    thumbnailCanvas.current.width = thumbnailWidth;
    thumbnailCanvas.current.height = thumbnailHeight;

    const ctx = canvas.current.getContext("2d");
    const thumbnailCtx = thumbnailCanvas.current.getContext("2d");

    const interval = setInterval(() => {
      if (!video.current) {
        clearInterval(interval);
      } else {
        ctx.drawImage(video.current, 0, 0, width, height);
        let pixels = ctx.getImageData(0, 0, width, height);
        pixels = floydSteinbergDithering(pixels, width, height);
        ctx.putImageData(pixels, 0, 0);

        thumbnailCtx.drawImage(
          thumbnailVideo.current,
          0,
          0,
          thumbnailWidth,
          thumbnailHeight
        );
        let thumbnailPixels = thumbnailCtx.getImageData(
          0,
          0,
          thumbnailWidth,
          thumbnailHeight
        );
        thumbnailPixels = floydSteinbergDithering(
          thumbnailPixels,
          thumbnailWidth,
          thumbnailHeight
        );
        thumbnailCtx.putImageData(thumbnailPixels, 0, 0);
      }
    }, 256);
  }

  function takePhoto() {
    //snap.currentTIme = 0;
    //snap.play();a
    const time = Date.now();
    const full = canvas.current.toDataURL("image/png");
    const thumbnail = thumbnailCanvas.current.toDataURL("image/png");
    setPhotos([{ full, thumbnail, time }, ...photos]);
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
    <div>
      <div className="relative" style={{ height }}>
        {loading && (
          <div className="absolute top-0 bottom-0 right-0 left-0 flex items-center justify-center">
            <img src="/icons/watch.png" />
          </div>
        )}
        {errorText && (
          <div className="absolute top-0 bottom-0 right-0 left-0 flex items-center justify-center">
            <h1 className="font-chicago">{errorText}</h1>
          </div>
        )}
        <canvas ref={canvas} className="" />
        {viewingPhoto !== null && (
          <div className="absolute top-0 bottom-0 right-0 left-0 flex items-center justify-center">
            <img src={photos[viewingPhoto].full} />
          </div>
        )}
      </div>
      <video ref={video} className="hidden" />

      <canvas ref={thumbnailCanvas} className="hidden" />
      <video ref={thumbnailVideo} className="hidden" />

      <div className="flex items-center justify-center border-t border-black py-1">
        {viewingPhoto == null ? (
          <button
            className="border rounded block mx-2 focus:outline-none active:bg-black active:text-white border-black py-1 px-2 font-chicago"
            onClick={takePhoto}
            disabled={loading}
          >
            Take photo
          </button>
        ) : (
          <>
            {/* <button
              className="border rounded block mx-1 focus:outline-none active:bg-black active:text-white border-black py-1 px-2 font-chicago"
              onClick={() => setViewingPhoto(null)}
            >
              Back to camera
            </button> */}

            <button
              className="border rounded block mx-1 focus:outline-none active:bg-black active:text-white border-black py-1 px-2 font-chicago"
              onClick={() => deletePhoto(viewingPhoto)}
            >
              Delete
            </button>
            <a
              className="border rounded block mx-1 focus:outline-none active:bg-black active:text-white border-black py-1 px-2 font-chicago"
              href={photos[viewingPhoto].full}
              download={`mockintosh-photobooth-${photos[viewingPhoto].time}`}
            >
              Save
            </a>
          </>
        )}
      </div>

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
};

function floydSteinbergDithering(pixels, width, height) {
  function index(x, y, width) {
    return (x + y * width) * 4;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const red = pixels.data[index(x, y, width)];
      const green = pixels.data[index(x, y, width) + 1];
      const blue = pixels.data[index(x, y, width) + 2];

      const average = Math.round((red + green + blue) / 3);
      const newValue = Math.round(average / 255) * 255;

      pixels.data[index(x, y, width)] = newValue;
      pixels.data[index(x, y, width) + 1] = newValue;
      pixels.data[index(x, y, width) + 2] = newValue;

      const avgError = average - newValue;

      //todo: make this prettier :)

      pixels.data[index(x + 1, y, width) + 0] =
        pixels.data[index(x + 1, y, width) + 0] + avgError * (7 / 16);
      pixels.data[index(x + 1, y, width) + 1] =
        pixels.data[index(x + 1, y, width) + 1] + avgError * (7 / 16);
      pixels.data[index(x + 1, y, width) + 2] =
        pixels.data[index(x + 1, y, width) + 2] + avgError * (7 / 16);

      pixels.data[index(x - 1, y + 1, width) + 0] =
        pixels.data[index(x - 1, y + 1, width) + 0] + avgError * (3 / 16);
      pixels.data[index(x - 1, y + 1, width) + 1] =
        pixels.data[index(x - 1, y + 1, width) + 1] + avgError * (3 / 16);
      pixels.data[index(x - 1, y + 1, width) + 2] =
        pixels.data[index(x - 1, y + 1, width) + 2] + avgError * (3 / 16);

      pixels.data[index(x, y + 1, width) + 0] =
        pixels.data[index(x, y + 1, width) + 0] + avgError * (5 / 16);
      pixels.data[index(x, y + 1, width) + 1] =
        pixels.data[index(x, y + 1, width) + 1] + avgError * (5 / 16);
      pixels.data[index(x, y + 1, width) + 2] =
        pixels.data[index(x, y + 1, width) + 2] + avgError * (5 / 16);

      pixels.data[index(x + 1, y + 1, width) + 0] =
        pixels.data[index(x + 1, y + 1, width) + 0] + avgError * (1 / 16);
      pixels.data[index(x + 1, y + 1, width) + 1] =
        pixels.data[index(x + 1, y + 1, width) + 1] + avgError * (1 / 16);
      pixels.data[index(x + 1, y + 1, width) + 2] =
        pixels.data[index(x + 1, y + 1, width) + 2] + avgError * (1 / 16);
    }
  }

  return pixels;
}
