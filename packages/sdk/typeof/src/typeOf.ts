import { TypeOfTypes } from './TypeOfTypes'

export const typeOf = <T>(item: T): TypeOfTypes => {
  return Array.isArray(item) ? 'array' : typeof item
}
