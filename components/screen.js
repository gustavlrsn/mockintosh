export default ({ children, width = 512, height = 342, zoom }) => (
  <div
    style={{ width, height, transform: `scale(${zoom})` }}
    className="flex corner flex-col relative"
  >
    {children}
  </div>
);
