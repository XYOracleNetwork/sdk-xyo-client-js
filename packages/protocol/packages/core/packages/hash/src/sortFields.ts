import { AnyObject, isObject, StringKeyObject } from '@xyo-network/object'

//if an object, sub-sort
const subSort = (value: unknown) => {
  return isObject(value) ? sortFields(value) : value
}

export const sortFields = <T extends AnyObject = AnyObject>(obj: T) => {
  const stringyObj = obj as StringKeyObject

  const result: StringKeyObject = {}
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      result[key] = subSort(stringyObj[key])
    })
  return result as T
}
