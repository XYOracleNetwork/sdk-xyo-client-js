import type { Payload } from './Payload.ts'

/**
 * A function that validates the supplied payload synchronously
 */
export type SyncPayloadValidationFunction<T extends Payload = Payload> = (payload: T) => boolean

/**
 * A function that validates the supplied payload asynchronously
 */
export type AsyncPayloadValidationFunction<T extends Payload = Payload> = (payload: T) => Promise<boolean>

/**
 * A function that validates the supplied payload
 */
export type PayloadValidationFunction<T extends Payload = Payload> = SyncPayloadValidationFunction<T> | AsyncPayloadValidationFunction<T>
