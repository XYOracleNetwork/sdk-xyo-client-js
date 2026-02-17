/* eslint-disable @typescript-eslint/no-deprecated */
/* eslint-disable sonarjs/deprecation */
import { typeOf } from './typeOf.ts'

/** @deprecated use @xylabs/typeof or zod */
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
