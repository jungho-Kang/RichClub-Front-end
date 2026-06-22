export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie
    .split("; ")
    .find(row => row.startsWith(`${name}=`));

  return match?.split("=")[1];
}
