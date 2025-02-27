import { typeOf } from './typeOf.ts'
import type { TypeOfTypes } from './TypeOfTypes.ts'

export const validateType = <T>(typeName: TypeOfTypes, value: T, optional = false): [T | undefined, Error[]] => {
  switch (typeOf(value)) {
    case typeName: {
      return [value, []]
    }
    default: {
      if (optional && typeOf(value) === 'undefined') {
        return [value, []]
      }
      return [undefined, [new Error(`value type is not '${typeName}:${typeof value}'`)]]
    }
  }
}
