import { AnyObject, StringKeyObject } from '@xyo-network/object'
import { typeOf } from '@xyo-network/typeof'

//if an object, sub-sort
const subSort = (value: unknown) => {
  switch (typeOf(value)) {
    case 'object':
      return sortFields(value as Record<string, unknown>)
    default:
      return value
  }
}

export const sortFields = <T extends AnyObject = AnyObject>(obj: T) => {
  const stringyObj = obj as StringKeyObject

  const result: StringKeyObject = {}
  Object.keys(stringyObj)
    .sort()
    .forEach((key) => {
      result[key] = subSort(stringyObj[key])
    })
  return result as T
}
