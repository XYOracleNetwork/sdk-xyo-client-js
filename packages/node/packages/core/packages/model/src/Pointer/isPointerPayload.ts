import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessPointerSchema } from './BoundWitnessPointer'
import { PayloadPointerSchema } from './PayloadPointer'
import { PointerPayload } from './Pointer'

export const isPointerPayload = (x?: Payload | null): x is PointerPayload =>
  x?.schema === PayloadPointerSchema || x?.schema === BoundWitnessPointerSchema
