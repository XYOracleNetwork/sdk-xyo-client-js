import { isType } from './isType'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isObject = (value: any): value is Record<string | number | symbol, any> => {
  return isType(value, 'object')
}
