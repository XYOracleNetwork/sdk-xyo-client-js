import shajs from 'sha.js'

import { sortedStringify } from './sortedStringify'

export const sortedHash = <T extends Record<string, unknown>>(obj: T) => {
  return sortedHashArray(obj).digest('hex')
}

export const sortedHashArray = <T extends Record<string, unknown>>(obj: T) => {
  const stringObject = sortedStringify<T>(obj)
  return shajs('sha256').update(stringObject)
}
