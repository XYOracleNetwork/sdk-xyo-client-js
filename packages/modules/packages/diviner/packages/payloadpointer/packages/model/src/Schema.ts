import { asSchema } from '@xyo-network/payload-model'

/**
 * The schema used for the Payload Pointer Diviner.
 */
export const PayloadPointerDivinerSchema = asSchema('network.xyo.diviner.payload.pointer', true)

/**
 * The schema type used for the Payload Pointer Diviner.
 */
export type PayloadPointerDivinerSchema = typeof PayloadPointerDivinerSchema
