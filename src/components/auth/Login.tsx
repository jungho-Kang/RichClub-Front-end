import axios from "axios";
import Swal from "sweetalert2";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import InputField from "@/components/ui/InputField";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({ mode: "onChange" });

  const showAlert = (title: string, text: string, icon: any) => {
    return Swal.fire({
      title,
      text,
      icon,
      background: "#101319",
      color: "#fff",
      confirmButtonColor: "#6F4CDB",
    });
  };

  const onSubmit = async (data: LoginForm) => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await axios.post("/api/v1/auth/login", data);

      await showAlert("로그인 성공", res.data.message, "success");

      navigate("/", { replace: true });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "로그인 정보를 확인해주세요.";

      await showAlert("로그인 실패", message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="space-y-5">
        {/* 폼 */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label="이메일"
            type="email"
            placeholder="example@email.com"
            {...register("email", {
              required: "이메일을 입력해주세요",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "올바른 이메일 형식이 아닙니다",
              },
            })}
            error={errors.email?.message}
          />

          <InputField
            label="비밀번호"
            type="password"
            placeholder="비밀번호 입력"
            {...register("password", {
              required: "비밀번호를 입력해주세요",
              minLength: {
                value: 6,
                message: "6자 이상 입력해주세요",
              },
            })}
            error={errors.password?.message}
          />

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-3 rounded-lg bg-[#6F4CDB] hover:bg-[#5C3CCF] text-white font-semibold disabled:opacity-50 transition"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
