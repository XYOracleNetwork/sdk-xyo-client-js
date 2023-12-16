import { typeOf } from '@xylabs/typeof'
import { AnyObject, EmptyObject } from '@xyo-network/object'

export const removeEmptyFields = <T extends EmptyObject>(obj: T): T => {
  if (obj === null || Array.isArray(obj)) return obj

  const newObject: AnyObject = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeOf(value) === 'object') {
      newObject[key] = removeEmptyFields(value as Record<string, unknown>)
    } else if (value !== undefined) {
      newObject[key] = value
    }
  }
  return newObject as T
}
