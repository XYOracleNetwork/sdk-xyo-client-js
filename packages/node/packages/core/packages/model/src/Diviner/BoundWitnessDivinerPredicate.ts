import { XyoBoundWitnessWithMeta } from '../BoundWitness'
import { PayloadWithMeta } from '../Payload'
import { PayloadDivinerPredicate } from './PayloadDivinerPredicate'

type WithoutSchema<T> = Omit<Omit<T, 'schema'>, 'schemas'>

// TODO: Should we just accept "schema"/"schemas" here and infer that they mean "payload_schemas"?
export type XyoBoundWitnessDivinerPredicate = WithoutSchema<PayloadDivinerPredicate & Partial<XyoBoundWitnessWithMeta & PayloadWithMeta>>
