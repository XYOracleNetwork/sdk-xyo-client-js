import { Payload } from './Payload.ts'

/**
 * A function that validates the supplied payload
 */
export type PayloadValidationFunction<T extends Payload = Payload> = (payload: T) => boolean | Promise<boolean>
