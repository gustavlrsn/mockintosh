export default ({ children, width = "100vw", height = "100vh", zoom }) => (
  <div
    style={{ width, height, transform: `scale(${zoom})` }}
    className="flex corner flex-col relative"
  >
    {children}
  </div>
);
