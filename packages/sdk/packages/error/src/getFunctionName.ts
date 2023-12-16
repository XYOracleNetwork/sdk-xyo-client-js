/* eslint-disable import/no-deprecated */
import { handleError } from './handleError'

/** @deprecated use functionName from @xylabs/function-name instead */
export const getFunctionName = (depth = 2) => {
  try {
    throw new Error('Getting function name')
  } catch (error) {
    return handleError(error, (error) => {
      let newIndex: number | undefined
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
