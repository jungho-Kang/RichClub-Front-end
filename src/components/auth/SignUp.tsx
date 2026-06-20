import axios, { AxiosError } from "axios";
import Swal from "sweetalert2";
import * as yup from "yup";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface SignUpForm {
  nickname: string;
  email: string;
  password: string;
}

const schema = yup.object({
  nickname: yup
    .string()
    .min(2, "닉네임은 2자 이상 입력해주세요.")
    .max(10, "닉네임은 10자 이하로 입력해주세요.")
    .matches(
      /^[가-힣a-zA-Z0-9_]+$/,
      "한글, 영문, 숫자, 언더바(_)만 사용할 수 있습니다.",
    )
    .required("닉네임을 입력해주세요."),
  email: yup
    .string()
    .email("올바른 이메일 형식이 아닙니다.")
    .required("이메일을 입력해주세요."),
  password: yup
    .string()
    .min(8, "비밀번호는 8자 이상 입력해주세요.")
    .max(20, "비밀번호는 20자 이하로 입력해주세요.")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).+$/,
      "영문, 숫자, 특수문자를 포함해야 합니다.",
    )
    .matches(/^\S+$/, "공백은 사용할 수 없습니다.")
    .required("비밀번호를 입력해주세요."),
});

const SignUp = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignUpForm>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const showError = (message: string) => {
    return Swal.fire({
      title: "회원가입 실패",
      html: message,
      icon: "error",
      background: "#101319",
      color: "#fff",
      confirmButtonColor: "#6F4CDB",
    });
  };

  const onSubmit = async (data: SignUpForm) => {
    try {
      const res = await axios.post("/api/v1/auth/signup", data);

      await axios.post("/api/v1/auth/email-verification/request", {
        email: data.email,
      });

      navigate("/auth/email", {
        replace: true,
        state: { email: data.email },
      });
    } catch (error: unknown) {
      const err = error as AxiosError<any>;

      const message =
        err.response?.status === 400
          ? "이미 사용 중인 이메일입니다."
          : "입력 정보를 다시 확인해주세요.";

      await showError(message);
    }
  };

  return (
    <div>
      <div className="space-y-5">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* 닉네임 */}
          <div>
            <label className="text-sm text-gray-300">닉네임</label>
            <input
              type="text"
              placeholder="사용할 닉네임"
              {...register("nickname")}
              className="mt-1 w-full px-4 py-2 rounded-lg bg-[#101319] border border-[#262B36] text-white focus:outline-none focus:border-[#6F4CDB] focus:ring-1 focus:ring-[#6F4CDB]"
            />
            {errors.nickname && (
              <p className="text-xs text-red-400 mt-1">
                {errors.nickname.message}
              </p>
            )}
          </div>

          {/* 이메일 */}
          <div>
            <label className="text-sm text-gray-300">이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              {...register("email")}
              className="mt-1 w-full px-4 py-2 rounded-lg bg-[#101319] border border-[#262B36] text-white focus:outline-none focus:border-[#6F4CDB] focus:ring-1 focus:ring-[#6F4CDB]"
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="text-sm text-gray-300">비밀번호</label>
            <input
              type="password"
              placeholder="8자 이상 입력"
              {...register("password")}
              className="mt-1 w-full px-4 py-2 rounded-lg bg-[#101319] border border-[#262B36] text-white focus:outline-none focus:border-[#6F4CDB] focus:ring-1 focus:ring-[#6F4CDB]"
            />
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 버튼 */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-3 rounded-lg bg-[#6F4CDB] hover:bg-[#5C3CCF] text-white font-semibold disabled:opacity-50 transition"
          >
            {isSubmitting ? "가입 중..." : "회원가입"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            가입 후 이메일 인증이 필요합니다.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
