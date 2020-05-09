const Icon = ({ img, title, open, openWindow }) => {
  // const [selected, setSelected] = useState(false);
  // click outside removes...
  const selected = false;
  return (
    <div
      className={`h-12 flex items-center flex-col ${
        open ? "cursor-default" : "cursor-pointer"
      }`}
      // onClick={() => {
      //   if (selected) {
      //     openWindow();
      //   } else {
      //     setSelected(true);
      //   }
      // }}
      onClick={!open && openWindow}
    >
      {open ? (
        <div className="bg-checkers w-8 h-8" />
      ) : (
        <img src={img} className={`w-8 h-8 ${selected ? "inverted" : ""}`} />
      )}

      <span
        className={`block font-arial ${
          selected ? "bg-black text-white" : "bg-white"
        }`}
        style={{ padding: "2px 2px 0 2px" }}
      >
        {title}
      </span>
    </div>
  );
};

export default Icon;
