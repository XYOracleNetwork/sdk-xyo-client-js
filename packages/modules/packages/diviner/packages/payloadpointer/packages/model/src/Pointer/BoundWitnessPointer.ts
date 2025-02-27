import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import type { Payload } from '@xyo-network/payload-model'

import type { PointerPayload } from './Pointer.ts'

export type BoundWitnessPointerSchema = `${BoundWitnessSchema}.pointer`
export const BoundWitnessPointerSchema: BoundWitnessPointerSchema = `${BoundWitnessSchema}.pointer`

export type BoundWitnessPointerPayload = PointerPayload & {
  schema: BoundWitnessPointerSchema
}

/**
 * Identity function for determining if an object is a BoundWitness Pointer
 * @param x The object to check
 */
export const isBoundWitnessPointer = (x?: Payload | null): x is BoundWitnessPointerPayload => x?.schema === BoundWitnessPointerSchema
