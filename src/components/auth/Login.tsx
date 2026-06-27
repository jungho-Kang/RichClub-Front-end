import axios from "axios";
import { setCookie } from "@/utils/cookie";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useModalStore } from "@/stores/useModalStore";
import InputField from "@/components/ui/InputField";
import { useNavigate } from "react-router-dom";
import { alertError, alertSuccess } from "@/lib/swal";

interface LoginForm {
  email: string;
  password: string;
}

interface LoginProps {
  onForgotPassword: () => void;
}

const Login = ({ onForgotPassword }: LoginProps) => {
  const { close } = useModalStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginForm>({ mode: "onChange" });

  const onSubmit = async (data: LoginForm) => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await axios.post("/api/v1/auth/login", data);
      const accessToken = res.data.access_token;
      setCookie("accessToken", accessToken, { hours: 1 });

      setLoading(false);

      await alertSuccess("로그인 성공", "로그인이 정상적으로 완료되었습니다.");
      close();
      navigate("/", { replace: true });
      window.location.reload();
    } catch {
      setLoading(false);
      await alertError("로그인 실패", "로그인 정보를 확인해주세요.");
    }
  };

  return (
    <div>
      <div className="space-y-5">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label="이메일"
            type="email"
            placeholder="example@email.com"
            {...register("email")}
          />
          <InputField
            label="비밀번호"
            type="password"
            placeholder="비밀번호 입력"
            {...register("password")}
          />
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[12px] text-gray-600 hover:text-gray-400
               transition-colors self-end focus-visible:outline-none
               focus-visible:ring-2 focus-visible:ring-[#7C5CFF] rounded-sm"
          >
            비밀번호를 잊으셨나요?
          </button>
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-3.5 rounded-lg bg-[#6F4CDB] hover:bg-[#5C3CCF] text-white font-semibold disabled:opacity-50 transition"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
