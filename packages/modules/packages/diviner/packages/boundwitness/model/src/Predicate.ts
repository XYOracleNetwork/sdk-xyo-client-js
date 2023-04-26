import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadDivinerPredicate } from '@xyo-network/payload-diviner-model'
import { Payload } from '@xyo-network/payload-model'

type WithoutSchema<T> = Omit<Omit<T, 'schema'>, 'schemas'>

// TODO: Should we just accept "schema"/"schemas" here and infer that they mean "payload_schemas"?
export type BoundWitnessDivinerPredicate = WithoutSchema<PayloadDivinerPredicate & Partial<BoundWitness & Payload>>
