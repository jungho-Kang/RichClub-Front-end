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
    path?: string;
  },
): void {
  if (typeof document === "undefined") return;

  const { days = 7, path = "/" } = options || {};

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=${path}`;
}

export function removeCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}
