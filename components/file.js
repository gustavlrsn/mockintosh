export default ({ content }) => {
  return (
    <div
      className="p-4 font-geneva content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
