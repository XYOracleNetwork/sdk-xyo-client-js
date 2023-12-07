import { AnyObject } from './AnyObject'
import { isType } from './isType'

export const isObject = (value: unknown): value is AnyObject => {
  return isType(value, 'object')
}
