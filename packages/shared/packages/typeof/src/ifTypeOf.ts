import { typeOf } from './typeOf'
import { TypeOfTypes } from './TypeOfTypes'

export const ifTypeOf = <T, R>(typeName: TypeOfTypes, value: unknown, trueFunction: (value: T) => R, isFunction?: (value: T) => boolean) => {
  switch (typeOf(value)) {
    case typeName: {
      return !isFunction || isFunction(value as T) ? trueFunction(value as T) : undefined
    }
  }
}
