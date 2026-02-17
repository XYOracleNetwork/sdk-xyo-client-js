/* eslint-disable @typescript-eslint/no-deprecated */
/* eslint-disable sonarjs/deprecation */
import { typeOf } from './typeOf.ts'
import type { TypeOfTypes } from './TypeOfTypes.ts'

/** @deprecated use @xylabs/typeof or zod */
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
