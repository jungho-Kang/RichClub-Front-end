interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  mode: "login" | "signup";
  onChangeMode: (mode: "login" | "signup") => void;
}

const Modal = ({
  open,
  onClose,
  title,
  children,
  mode,
  onChangeMode,
}: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 카드 */}
      <div className="relative z-10 w-full max-w-md bg-[#141519] border border-[#26272c] rounded-2xl p-6 shadow-lg">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#1f2430] transition"
        >
          <span className="text-gray-400 hover:text-white text-sm">✕</span>
        </button>

        {/* 타이틀 */}
        <div className="text-center mb-6 space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Rich
            <span className="bg-linear-to-r from-[#7C5CFF] to-[#B794F4] bg-clip-text text-transparent">
              Club
            </span>
          </h2>
          <p className="text-sm text-gray-400">{title}</p>
        </div>

        {/* 로그인/회원가입 토글 버튼 */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => onChangeMode("login")}
            className={`text-sm w-full py-2 rounded-md transition ${
              mode === "login"
                ? "bg-[#2a2d36] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            로그인
          </button>

          <button
            onClick={() => onChangeMode("signup")}
            className={`text-sm w-full py-2 rounded-md transition ${
              mode === "signup"
                ? "bg-[#2a2d36] text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            회원가입
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Modal;
