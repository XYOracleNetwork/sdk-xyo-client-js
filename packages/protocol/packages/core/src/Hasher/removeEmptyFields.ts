import { typeOf } from '@xyo-network/typeof'

export const removeEmptyFields = <T extends Record<string, unknown>>(obj: T) => {
  if (obj === null || Array.isArray(obj)) return obj

  const newObject: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (typeOf(value) === 'object') {
      newObject[key] = removeEmptyFields(value as Record<string, unknown>)
    } else if (value !== undefined) {
      newObject[key] = value
    }
  })
  return newObject as T
}
