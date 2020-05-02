export default ({ content }) => {
  return (
    <div
      className="p-4 font-arial content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
