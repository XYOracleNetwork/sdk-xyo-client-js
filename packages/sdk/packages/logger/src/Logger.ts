/** @deprecated use from @xylabs/axios instead */
export type LogFunction = (message?: unknown) => void

/**
 * Interface to handle overlap between Winston &
 * `console` with as much congruency as possible.
 */
/** @deprecated use from @xylabs/axios instead */
export interface Logger {
  debug: LogFunction
  error: LogFunction
  info: LogFunction
  log: LogFunction
  warn: LogFunction
}

//to satisfy export
/** @deprecated use from @xylabs/axios instead */
export const LoggerStub = 1
