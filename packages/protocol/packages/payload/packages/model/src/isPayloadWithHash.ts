import { isAnyPayload } from './isPayload.ts'
import type { WithMeta } from './Meta.ts'
import type { Payload } from './Payload.ts'

/**
 * Return true if the value is a payload with the required meta fields
 * @param value The value to check
 * @returns True if the value is a payload with the required meta fields
 */
export const isWithHash = <T extends Payload>(value: T): value is WithMeta<T> => {
  return typeof (value as WithMeta<T>)?.$hash === 'string'
}

/**
 * Return true if the value is a payload with the required meta fields
 * @param value The value to check
 * @returns True if the value is a payload with the required meta fields
 */
export const isPayloadWithHash = <T extends Payload>(value: unknown): value is WithMeta<T> => {
  return isAnyPayload(value) && isWithHash(value)
}
