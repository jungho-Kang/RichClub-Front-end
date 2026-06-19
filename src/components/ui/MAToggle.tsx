const MAToggle = ({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
    >
      <span
        className="w-2.5 h-2.5 rounded-full border"
        style={{
          background: active ? color : "transparent",
          borderColor: color,
        }}
      />
      <span className={active ? "text-zinc-200" : "text-zinc-500"}>
        {label}
      </span>
    </button>
  );
};
export default MAToggle;
