import type { EmptyObject } from '@xylabs/object'
import { typeOf } from '@xylabs/typeof'

export const hasEmptyFields = <T extends EmptyObject>(obj: T): boolean => {
  if (obj == null || Array.isArray(obj)) return false

  if (obj == undefined || Object.keys(obj).length === 0) return true

  for (const [value] of Object.values(obj)) {
    if (typeOf(value) === 'object') {
      if (hasEmptyFields(value as Record<string, unknown>)) return true
    } else if (value === undefined) {
      return true
    }
  }
  return false
}
