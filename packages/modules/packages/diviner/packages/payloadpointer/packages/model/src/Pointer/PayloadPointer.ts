import type { Payload } from '@xyo-network/payload-model'
import { asSchema, PayloadSchema } from '@xyo-network/payload-model'

import type { PointerPayload } from './Pointer.ts'

export const PayloadPointerSchema = asSchema(`${PayloadSchema}.pointer`, true)
export type PayloadPointerSchema = typeof PayloadPointerSchema

export type PayloadPointerPayload = PointerPayload & {
  schema: PayloadPointerSchema
}

/**
 * Identity function for determining if an object is a Payload Pointer
 * @param x The object to check
 */
export const isPayloadPointer = (x?: Payload | null): x is PayloadPointerPayload => x?.schema === PayloadPointerSchema
