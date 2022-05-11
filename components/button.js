const Button = ({
  children,
  onClick,
  href,
  disabled,
  className = "",
  type = "button",
  ...props
}) => {
  const classes =
    "block focus:outline-none font-chicago" +
    " " +
    (disabled ? "cursor-default" : "active:bg-black active:text-white");

  return (
    <div className="flex justify-start">
      <div className={"relative button-outside " + className}>
        {href ? (
          <a className={classes} href={href} {...props}>
            <div className="relative block button-inside">{children}</div>
          </a>
        ) : (
          <button
            className={classes}
            onClick={onClick}
            disabled={disabled}
            type={type}
            {...props}
          >
            <div className="relative button-inside block">
              {disabled && <div className="absolute inset-0 disabled"></div>}
              {children}
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Button;
