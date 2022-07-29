import { typeOf } from './typeOf'

export const ifDefined = <T>(value: T, func: (value: T) => void) => {
  switch (typeOf(value)) {
    case 'undefined':
    case 'null':
      break
    default:
      func(value)
      return value
  }
}
