import { TypeOfTypes } from './TypeOfTypes.js'

export const typeOf = <T>(item: T): TypeOfTypes => {
  return Array.isArray(item) ? 'array' : typeof item
}
