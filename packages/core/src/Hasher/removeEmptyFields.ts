import { typeOf } from '@xyo-network/typeof'

export const removeEmptyFields = (obj: Record<string, unknown>) => {
  if (obj === null || Array.isArray(obj)) return obj

  const newObject: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (typeOf(value) === 'object') {
      newObject[key] = removeEmptyFields(value as Record<string, unknown>)
    } else if (value !== undefined) {
      newObject[key] = value
    }
  })
  return newObject
}
