import { typeOf } from './typeOf.ts'
import { TypeOfTypes } from './TypeOfTypes.ts'

export const ifTypeOf = <T, R>(
  typeName: TypeOfTypes,
  value: unknown,
  trueFunction: (value: T) => R,
  isFunction?: (value: T) => boolean,
): R | undefined => {
  switch (typeOf(value)) {
    case typeName: {
      return !isFunction || isFunction(value as T) ? trueFunction(value as T) : undefined
    }
  }
}
