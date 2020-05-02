import Window from "./Window";

export default ({ title, content, defaultPosition, close }) => {
  return (
    <Window title={title} defaultPosition={defaultPosition} close={close}>
      <div
        className="p-4 font-arial content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Window>
  );
};
