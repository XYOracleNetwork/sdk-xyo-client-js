import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { PayloadDivinerPredicate } from '@xyo-network/diviner-payload-model'
import type { Payload } from '@xyo-network/payload-model'

export type WithoutSchemas<T> = Omit<Omit<T, 'schema'>, 'schemas'>

// TODO: Should we just accept "schema"/"schemas" here and infer that they mean "payload_schemas"?
export type BoundWitnessDivinerPredicate = WithoutSchemas<PayloadDivinerPredicate & Partial<BoundWitness & Payload & { destination: string[] }>>
