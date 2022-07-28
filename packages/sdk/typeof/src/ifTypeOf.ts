import { typeOf } from './typeOf'
import { TypeOfTypes } from './TypeOfTypes'

export const ifTypeOf = <T, R>(typeName: TypeOfTypes, value: unknown, trueFunc: (value: T) => R, isFunc?: (value: T) => boolean) => {
  switch (typeOf(value)) {
    case typeName:
      return !isFunc || isFunc(value as T) ? trueFunc(value as T) : undefined
  }
}
