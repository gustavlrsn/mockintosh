const Icon = ({
  icon: { title, img, type, payload },
  openWindow,
  openWindows,
}) => {
  const active =
    openWindows.length && openWindows[openWindows.length - 1].title === title;
  const open = Boolean(openWindows.find((window) => window.title === title));

  return (
    <div
      className={`m-1 flex items-center flex-col ${
        open ? "cursor-default" : "cursor-pointer"
      }`}
      onClick={
        open
          ? () => {}
          : () =>
              openWindow({
                title,
                type,
                payload,
              })
      }
    >
      {false ? (
        <div className="bg-checkers w-8 h-8" />
      ) : (
        <img src={img} className={`w-8 h-8 ${active ? "" : ""}`} />
      )}

      <span
        className={`block font-arial ${
          active ? "bg-black text-white" : "bg-white"
        }`}
        style={{ padding: "2px 2px 0 2px" }}
      >
        {title}
      </span>
    </div>
  );
};

export default Icon;
