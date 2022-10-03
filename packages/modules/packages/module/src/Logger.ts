// TODO: Pull in from SDK once migrated to SDK

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogFunction = (message?: any) => void

/**
 * Interface to handle overlap between Winston &
 * `console` with as much congruency as possible.
 */
export interface Logger {
  debug: LogFunction
  error: LogFunction
  info: LogFunction
  log: LogFunction
  // trace: LogFunction
  warn: LogFunction
}
