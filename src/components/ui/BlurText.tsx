interface BlurTextProps {
  children: React.ReactNode;
  isLocked: boolean;
  className?: string;
}

const BlurText = ({ children, isLocked, className = "" }: BlurTextProps) => {
  return (
    <span
      className={[
        "transition-all duration-300",
        isLocked
          ? "blur-[6px] opacity-40 select-none pointer-events-none"
          : "blur-0 opacity-100",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
};

export default BlurText;
