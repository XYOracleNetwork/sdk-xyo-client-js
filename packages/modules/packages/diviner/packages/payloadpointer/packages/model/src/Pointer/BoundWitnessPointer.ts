import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { asSchema, type Payload } from '@xyo-network/payload-model'

import type { PointerPayload } from './Pointer.ts'

export const BoundWitnessPointerSchema = asSchema(`${BoundWitnessSchema}.pointer`, true)
export type BoundWitnessPointerSchema = typeof BoundWitnessPointerSchema

export type BoundWitnessPointerPayload = PointerPayload & {
  schema: BoundWitnessPointerSchema
}

/**
 * Identity function for determining if an object is a BoundWitness Pointer
 * @param x The object to check
 */
export const isBoundWitnessPointer = (x?: Payload | null): x is BoundWitnessPointerPayload => x?.schema === BoundWitnessPointerSchema
