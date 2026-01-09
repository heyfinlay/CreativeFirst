export function safeNextPath(
  nextPath: string | null | undefined,
  fallback = "/app"
) {
  if (!nextPath) return fallback;
  if (!nextPath.startsWith("/")) return fallback;
  if (nextPath.includes("http") || nextPath.includes("//")) return fallback;
  return nextPath;
}
