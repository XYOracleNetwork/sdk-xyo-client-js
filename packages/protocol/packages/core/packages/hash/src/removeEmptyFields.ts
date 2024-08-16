import type { AnyObject, EmptyObject } from '@xylabs/object'
import { typeOf } from '@xylabs/typeof'

export const removeEmptyFields = <T extends EmptyObject>(obj: T): T => {
  if (obj === null) return obj

  if (Array.isArray(obj)) {
    return obj.map(value => (typeof value === 'object' ? removeEmptyFields(value) : value)) as T
  }

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
