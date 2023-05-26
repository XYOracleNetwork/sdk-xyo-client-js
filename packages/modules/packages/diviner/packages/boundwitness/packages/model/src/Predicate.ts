import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadDivinerPredicate } from '@xyo-network/diviner-payload-model'
import { Payload } from '@xyo-network/payload-model'

export type WithoutSchema<T> = Omit<Omit<T, 'schema'>, 'schemas'>

// TODO: Should we just accept "schema"/"schemas" here and infer that they mean "payload_schemas"?
export type BoundWitnessDivinerPredicate = WithoutSchema<PayloadDivinerPredicate & Partial<BoundWitness & Payload>>
