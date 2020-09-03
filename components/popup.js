const Popup = ({ children }) => {
  return (
    <div className="absolute inset-0 flex justify-center items-center z-40">
      <div className="w-64 bg-white border border-black p-0.5 font-geneva">
        <div className="border-2 border-black p-4">{children}</div>
      </div>
    </div>
  );
};

export default Popup;
