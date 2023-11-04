import Icon from "../icon";
import { Window, WindowScrollArea } from "../ui/window";
export default function Folder({ icons, path, openWindow, window, i }) {
  return (
    <Window i={i} {...window}>
      <WindowScrollArea resizable>
        <div className="p-5 flex">
          {icons &&
            icons.map((icon) => (
              <Icon
                path={path + "/" + icon.title}
                key={icon.title}
                icon={icon}
                openWindow={openWindow}
              />
            ))}
        </div>
      </WindowScrollArea>
    </Window>
  );
}
