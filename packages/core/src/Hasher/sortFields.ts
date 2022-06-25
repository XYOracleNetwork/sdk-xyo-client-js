import { StringKeyObject, typeOf } from '../lib'

//if an object, subsort
const subSort = (value: unknown) => {
  switch (typeOf(value)) {
    case 'object':
      return sortFields(value as Record<string, unknown>)
    default:
      return value
  }
}

export const sortFields = <T extends object = object>(obj: T) => {
  if (obj === null) {
    return null
  }

  const stringyObj = obj as StringKeyObject

  const result: StringKeyObject = {}
  Object.keys(stringyObj)
    .sort()
    .forEach((key) => {
      result[key] = subSort(stringyObj[key])
    })
  return result as T
}
