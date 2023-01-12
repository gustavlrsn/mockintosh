export default ({ children, width = "100vw", height = "100vh", showMac }) => {
  if (showMac)
    return (
      <div className="flex flex-shrink-0 flex-col m-6 origin-top">
        <img src="/macse-t.png" />
        <div className="flex">
          <img src="/macse-l.png" />
          <div
            style={{ width, height }}
            className="flex flex-col relative overflow-hidden bg"
          >
            <div className="absolute inset-0 corner z-50 pointer-events-none" />
            {children}
          </div>
          <img src="/macse-r.png" />
        </div>
        <img src="/macse-b.png" />
      </div>
    );

  return (
    <div
      style={{ width, height }}
      className="flex flex-col relative overflow-hidden bg"
    >
      <div className="absolute inset-0 corner z-50 pointer-events-none" />
      {children}
    </div>
  );
};
