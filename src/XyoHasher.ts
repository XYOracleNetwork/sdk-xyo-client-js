import { sortedHash } from './sortedHash'
import { sortedStringify } from './sortedStringify'

export const removeUnderscoreFields = (obj: Record<string, unknown>) => {
  const fields: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (!key.startsWith('_')) {
      fields[key] = value
    }
  })
  return fields
}

export const removeEmptyFields = (obj: Record<string, unknown>) => {
  const fields: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      fields[key] = value
    }
  })
  return fields
}

export class XyoHasher<T extends Record<string, unknown>> {
  public readonly obj: T
  constructor(obj: T) {
    this.obj = obj
  }

  get hashFields() {
    return removeEmptyFields(removeUnderscoreFields(this.obj))
  }

  public sortedStringify() {
    return sortedStringify(this.hashFields)
  }

  public sortedHash() {
    return sortedHash(this.hashFields)
  }
}
