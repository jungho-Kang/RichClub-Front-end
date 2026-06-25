export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie
    .split("; ")
    .find(row => row.startsWith(`${name}=`));

  return match?.split("=")[1];
}

export function setCookie(
  name: string,
  value: string,
  options?: {
    days?: number;
    hours?: number; // 💡 시간 단위를 설정할 수 있도록 추가
    path?: string;
  },
): void {
  if (typeof document === "undefined") return;

  const { days, hours, path = "/" } = options || {};

  const date = new Date();

  if (hours) {
    // 💡 시간(hours) 옵션이 있으면 시간 단위 밀리초를 더함 (1시간 = 60분 * 60초 * 1000ms)
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  } else {
    // 기본값 처리: days가 없으면 기존처럼 7일로 설정
    const expireDays = days ?? 7;
    date.setTime(date.getTime() + expireDays * 24 * 60 * 60 * 1000);
  }

  // 보다 안전한 브라우저 쿠키 관리를 위해 SameSite=Lax 설정을 함께 권장합니다.
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=${path}; SameSite=Lax;`;
}

export function removeCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}
