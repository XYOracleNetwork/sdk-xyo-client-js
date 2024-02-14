import { WithMeta } from '../types.browser.cjs'
import { isAnyPayload } from './isPayload'
import { Payload } from './Payload'

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
