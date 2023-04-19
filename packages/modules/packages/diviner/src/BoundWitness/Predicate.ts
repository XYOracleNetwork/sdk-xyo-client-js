import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

import { PayloadDivinerPredicate } from '../Payload'

type WithoutSchema<T> = Omit<Omit<T, 'schema'>, 'schemas'>

// TODO: Should we just accept "schema"/"schemas" here and infer that they mean "payload_schemas"?
export type BoundWitnessDivinerPredicate = WithoutSchema<PayloadDivinerPredicate & Partial<BoundWitness & Payload>>
