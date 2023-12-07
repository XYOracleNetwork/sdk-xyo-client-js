import { AnyObject, EmptyObject } from '@xyo-network/object'
import { typeOf } from '@xyo-network/typeof'

export const removeEmptyFields = <T extends EmptyObject>(obj: T): T => {
  if (obj === null || Array.isArray(obj)) return obj

  const newObject: AnyObject = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (typeOf(value) === 'object') {
      newObject[key] = removeEmptyFields(value as Record<string, unknown>)
    } else if (value !== undefined) {
      newObject[key] = value
    }
  })
  return newObject as T
}
