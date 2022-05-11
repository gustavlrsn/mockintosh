const Icon = ({
  icon: { title, img, type, payload },
  openWindow,
  openWindows,
}) => {
  const active =
    openWindows.length && openWindows[openWindows.length - 1].title === title;
  // const open = Boolean(openWindows.find((window) => window.title === title));
  const open = false;
  return (
    <div
      className={`col-start-7 flex-none flex items-center flex-col ${
        (open ? "cursor-default" : "cursor-pointer") +
        " " +
        (title === "Trash" ? "place-self-end" : "")
      }`}
      style={{ minWidth: 64 }}
      onClick={() =>
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
        <img src={img} className={`w-8 h-8 ${active ? "inverted" : ""}`} />
      )}

      <span
        className={`block font-geneva whitespace-no-wrap ${
          active ? "bg-black text-white" : "bg-white"
        }`}
        style={{ padding: "0 2px", display: "inline-table" }}
      >
        {title}
      </span>
    </div>
  );
};

export default Icon;
