/** @deprecated use from @xylabs/logger instead */
export type LogFunction = (message?: unknown) => void

/**
 * Interface to handle overlap between Winston &
 * `console` with as much congruency as possible.
 */
/** @deprecated use from @xylabs/logger instead */
export interface Logger {
  debug: LogFunction
  error: LogFunction
  info: LogFunction
  log: LogFunction
  warn: LogFunction
}

//to satisfy export
/** @deprecated use from @xylabs/logger instead */
export const LoggerStub = 1
