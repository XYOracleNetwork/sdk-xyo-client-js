/** @deprecated use from @xylabs/logger instead */
export type LogFunction = (message?: unknown) => void
import { handleError } from '@xylabs/error'

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
    throw new Error('Just for Stack Trace')
  } catch (error) {
    return handleError(error, (error) => {
      let newIndex: number | undefined
      const stackParts = error.stack?.split('\n')[depth].split(' ')
      const functionName =
        stackParts?.find((item, index) => {
          if (item.length > 0 && item !== 'at') {
            //check if constructor
            if (item === 'new') {
              newIndex = index
            }
            return item
          }
        }) ?? '<unknown>'
      return newIndex ? `${functionName} ${stackParts?.[newIndex + 1]}` : functionName
    })
  }
}
