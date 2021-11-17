import { sortObject } from './sortObject'

const sortedStringify = <T extends Record<string, unknown>>(obj: T) => {
  const sortedEntry = sortObject<T>(obj)
  return JSON.stringify(sortedEntry)
}

export { sortedStringify }
