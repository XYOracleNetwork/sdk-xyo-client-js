import { handleError } from './handleError'

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
