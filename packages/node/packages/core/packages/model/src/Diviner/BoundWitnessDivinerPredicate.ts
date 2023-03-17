import { BoundWitnessWithMeta } from '../BoundWitness'
import { PayloadWithMeta } from '../Payload'
import { PayloadDivinerPredicate } from './PayloadDivinerPredicate'

type WithoutSchema<T> = Omit<Omit<T, 'schema'>, 'schemas'>

// TODO: Should we just accept "schema"/"schemas" here and infer that they mean "payload_schemas"?
export type BoundWitnessDivinerPredicate = WithoutSchema<PayloadDivinerPredicate & Partial<BoundWitnessWithMeta & PayloadWithMeta>>
