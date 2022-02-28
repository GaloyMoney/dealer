export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }
export const ErrorLevel = {
  Info: "info",
  Warn: "warn",
  Critical: "critical",
} as const
export type ErrorLevel = typeof ErrorLevel[keyof typeof ErrorLevel]
