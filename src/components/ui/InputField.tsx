import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputField = ({ label, error, ...props }: Props) => {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-300">{label}</label>

      <input
        {...props}
        className="w-full px-4 py-2 rounded-lg bg-[#101319] border border-[#262B36] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6F4CDB] focus:ring-1 focus:ring-[#6F4CDB] transition"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default InputField;
