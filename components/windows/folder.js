import Icon from "../icon";

export default function Folder({ icons, path, openWindow, openWindows }) {
  return (
    <div className="p-5 flex">
      {icons &&
        icons.map((icon) => (
          <Icon
            path={path + "/" + icon.title}
            key={icon.title}
            icon={icon}
            openWindow={openWindow}
            openWindows={openWindows}
          />
        ))}
    </div>
  );
}
