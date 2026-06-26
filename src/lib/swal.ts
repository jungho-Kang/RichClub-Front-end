import Swal from "sweetalert2";

const base = {
  width: 360,
  background: "#101319",
  color: "#fff",
  confirmButtonColor: "#6F4CDB",
} as const;

export const alertSuccess = (title: string, text: string) =>
  Swal.fire({ ...base, icon: "success", title, text });

export const alertError = (title: string, text: string) =>
  Swal.fire({ ...base, icon: "error", title, text });

export const alertWarning = (title: string, text: string) =>
  Swal.fire({ ...base, icon: "warning", title, text });

export const alertConfirm = (
  title: string,
  text: string,
  confirmButtonText = "확인",
  cancelButtonText = "취소",
) =>
  Swal.fire({
    ...base,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    cancelButtonColor: "#2a2d36",
  });

export const alertDanger = (
  title: string,
  text: string,
  confirmButtonText = "확인",
  cancelButtonText = "취소",
) =>
  Swal.fire({
    ...base,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#E44B58",
    cancelButtonColor: "#929292",
  });
