import { sortedHash } from './sortedHash'
import { sortedStringify } from './sortedStringify'

const removeUnderscoreFields = (obj: Record<string, unknown>) => {
  const fields: Record<string, unknown> = {}
  Object.keys(obj).forEach((key) => {
    if (!key.startsWith('_')) {
      fields[key] = obj[key]
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
    return removeUnderscoreFields(this.obj)
  }

  public sortedStringify() {
    return sortedStringify(this.hashFields)
  }

  public sortedHash() {
    return sortedHash(this.hashFields)
  }
}
