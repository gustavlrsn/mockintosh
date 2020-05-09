import { useRef, useState, useEffect } from "react";

export default ({}) => {
  const canvas = useRef(null);

  const video = useRef(null);
  const thumbnailCanvas = useRef(null);
  const thumbnailVideo = useRef(null);

  const [photos, setPhotos] = useState([]);

  function getVideo() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((localMediaStream) => {
        video.current.srcObject = localMediaStream;
        video.current.play();

        thumbnailVideo.current.srcObject = localMediaStream;
        thumbnailVideo.current.play();
      })
      .catch((err) => alert(err.message));
  }

  function paintToCanvas() {
    const width = 480;
    const height = 360;

    const thumbnailWidth = 96;
    const thumbnailHeight = 72;

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
  }

  useEffect(() => {
    getVideo();

    video.current.addEventListener("canplay", paintToCanvas);
    return () => {
      video.current.removeEventListener("canplay", paintToCanvas);

      const tracks = video.current.srcObject.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
      video.current.srcObject = null;
    };
  }, []);

  return (
    <div>
      <canvas ref={canvas} className="" style={{ height: 360 }} />
      <video ref={video} className="hidden" />

      <canvas ref={thumbnailCanvas} className="hidden" />
      <video ref={thumbnailVideo} className="hidden" />

      <div>
        <button
          className="border rounded my-2 block mx-auto focus:outline-none active:bg-black active:text-white border-black py-1 px-2 font-chicago"
          onClick={takePhoto}
        >
          Take photo
        </button>
      </div>

      <div className="overflow-x-scroll">
        <div className="flex overflow-x-auto bg-black h-20 py-1 border-t border-black">
          {photos.map(({ full, thumbnail, time }) => (
            <div key={time} className="w-24 flex-none ml-1">
              <a href={full} download={`pluto-photobooth-${time}`}>
                <img className="" src={thumbnail} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function floydSteinbergDithering(pixels, width, height) {
  function index(x, y, width) {
    return (x + y * width) * 4;
  }

  for (let y = 0; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
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
