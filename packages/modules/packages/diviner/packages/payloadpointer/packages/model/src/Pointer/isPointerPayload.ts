import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessPointerSchema } from './BoundWitnessPointer.js'
import { PayloadPointerSchema } from './PayloadPointer.js'
import { PointerPayload } from './Pointer.js'

/**
 * Identity function for determining if an object is a Pointer Payload (PayloadPointer or BoundWitnessPointer)
 * @param x The object to check
 */
export const isPointerPayload = (x?: Payload | null): x is PointerPayload =>
  x?.schema === PayloadPointerSchema || x?.schema === BoundWitnessPointerSchema
