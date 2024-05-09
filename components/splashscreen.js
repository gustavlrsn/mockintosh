import CanvasImage from "./canvas-image";

export default function Splashscreen({ onClick }) {
  return (
    <div
      className="absolute z-40 bg top-0 bottom-0 right-0 left-0 flex items-center justify-center"
      onClick={onClick}
    >
      <CanvasImage src="/icons/happy.png" height={32} width={32} />
    </div>
  );
}
