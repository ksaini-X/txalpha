export function getStatus(startTime: number): "upcoming" | "live" | "finished" {
  const now = Date.now();
  const matchDurationMs = 2 * 60 * 60 * 1000;

  if (now < startTime) return "upcoming";
  if (now < startTime + matchDurationMs) return "live";

  return "finished";
}
