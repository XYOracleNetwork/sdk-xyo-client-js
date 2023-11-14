/** @deprecated use from @xylabs/logger instead */
export type LogFunction = (message?: unknown) => void
import { handleError } from '@xyo-network/error'

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
  // trace: LogFunction
  warn: LogFunction
}

/** @deprecated use from @xylabs/logger instead */
export const getFunctionName = (depth = 2) => {
  try {
    throw Error()
  } catch (ex) {
    return handleError(ex, (error) => {
      let newIndex: number | undefined = undefined
      const stackParts = error.stack?.split('\n')[depth].split(' ')
      const funcName =
        stackParts?.find((item, index) => {
          if (item.length > 0 && item !== 'at') {
            //check if constructor
            if (item === 'new') {
              newIndex = index
            }
            return item
          }
        }) ?? '<unknown>'
      return newIndex ? `${funcName} ${stackParts?.[newIndex + 1]}` : funcName
    })
  }
}
