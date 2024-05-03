import { Window, WindowScrollArea } from "../ui/window";

export default function FileViewer({ content, window, i }) {
  return (
    <Window
      // key={window.title}
      i={i}
      {...window}
      // closeWindow={closeWindow}
      // bringWindowToFront={bringWindowToFront}
      // active={i === openApplications.length - 1}
      // width={350}
    >
      <WindowScrollArea resizable>
        <div
          className="p-4 font-geneva content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </WindowScrollArea>
    </Window>
  );
}
