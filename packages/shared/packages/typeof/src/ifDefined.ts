import { typeOf } from './typeOf.js'

export const ifDefined = <T>(value: T, function_: (value: T) => void): T | undefined => {
  switch (typeOf(value)) {
    case 'undefined':
    case 'null': {
      break
    }
    default: {
      function_(value)
      return value
    }
  }
}
