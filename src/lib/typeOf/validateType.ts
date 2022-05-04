import { typeOf } from './typeOf'
import { TypeOfTypes } from './TypeOfTypes'

export const validateType = <T>(typeName: TypeOfTypes, value: T, optional = false): [T | undefined, Error[]] => {
  switch (typeOf(value)) {
    case typeName:
      return [value, []]
    default: {
      if (optional && typeOf(value) === 'undefined') {
        return [value, []]
      }
      return [undefined, [Error(`value type is not '${typeName}:${typeof value}'`)]]
    }
  }
}
