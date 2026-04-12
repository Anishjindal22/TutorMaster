export default function IconBtn({
    text,
    onclick,
    children,
    disabled,
    outline = false,
    customClasses,
    type,
  }) {
    return (
      <button
        disabled={disabled}
        onClick={onclick}
        className={`flex items-center justify-center gap-x-2 rounded-xl py-2.5 px-6 font-semibold transition-all duration-300
          ${
            outline 
              ? "border border-brand-secondary bg-transparent text-brand-secondary hover:bg-brand-secondary/10" 
              : "bg-surface-light border border-surface-border text-white hover:bg-surface-dim"
          } 
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} 
          ${customClasses || ""}`}
        type={type}
      >
        {children ? (
          <>
            <span className={`${outline && "text-yellow-50"}`}>{text}</span>
            {children}
          </>
        ) : (
          text
        )}
      </button>
    )
  }