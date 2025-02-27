import { Payload, PayloadSchema } from '@xyo-network/payload-model'

import { PointerPayload } from './Pointer.ts'

export type PayloadPointerSchema = `${PayloadSchema}.pointer`
export const PayloadPointerSchema: PayloadPointerSchema = `${PayloadSchema}.pointer`

export type PayloadPointerPayload = PointerPayload & {
  schema: PayloadPointerSchema
}

/**
 * Identity function for determining if an object is a Payload Pointer
 * @param x The object to check
 */
export const isPayloadPointer = (x?: Payload | null): x is PayloadPointerPayload => x?.schema === PayloadPointerSchema
