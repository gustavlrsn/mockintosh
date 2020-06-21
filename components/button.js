export default ({
  children,
  onClick,
  href,
  disabled,
  className = "",
  ...props
}) => {
  const classes =
    "border overflow-hidden rounded block focus:outline-none border-black py-1 px-2 font-chicago" +
    " " +
    (disabled ? "cursor-default" : "active:bg-black active:text-white") +
    " " +
    className;

  return (
    <div className="relative">
      {disabled && <div className="absolute inset-0 disabled"></div>}

      {href ? (
        <a className={classes} href={href} {...props}>
          {children}
        </a>
      ) : (
        <button
          className={classes}
          onClick={onClick}
          disabled={disabled}
          {...props}
        >
          {children}
        </button>
      )}
    </div>
  );
};
