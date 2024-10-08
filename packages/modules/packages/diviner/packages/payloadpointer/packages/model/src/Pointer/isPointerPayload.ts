import type { Payload } from '@xyo-network/payload-model'

import { BoundWitnessPointerSchema } from './BoundWitnessPointer.ts'
import { PayloadPointerSchema } from './PayloadPointer.ts'
import type { PointerPayload } from './Pointer.ts'

/**
 * Identity function for determining if an object is a Pointer Payload (PayloadPointer or BoundWitnessPointer)
 * @param x The object to check
 */
export const isPointerPayload = (x?: Payload | null): x is PointerPayload =>
  x?.schema === PayloadPointerSchema || x?.schema === BoundWitnessPointerSchema
