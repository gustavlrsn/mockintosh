import Icon from "../icon";

export default ({ icons, openWindow, openWindows }) => (
  <div className="p-5 flex">
    {icons &&
      icons.map((icon) => (
        <Icon
          key={icon.title}
          icon={icon}
          openWindow={openWindow}
          openWindows={openWindows}
        />
      ))}
  </div>
);
