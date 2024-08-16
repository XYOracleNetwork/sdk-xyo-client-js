import type { TypeOfTypes } from './TypeOfTypes.ts'

export const typeOf = <T>(item: T): TypeOfTypes => {
  return Array.isArray(item) ? 'array' : typeof item
}
