/* eslint-disable @typescript-eslint/no-deprecated */
/* eslint-disable sonarjs/deprecation */
import type { TypeOfTypes } from './TypeOfTypes.ts'

/** @deprecated use @xylabs/typeof or zod */
export const typeOf = <T>(item: T): TypeOfTypes => {
  return Array.isArray(item) ? 'array' : typeof item
}
