import { XyoBoundWitnessWithMeta } from '../BoundWitness'
import { XyoPayloadWithMeta } from '../Payload'
import { XyoPayloadDivinerPredicate } from './XyoPayloadDivinerPredicate'

type WithoutSchema<T> = Omit<Omit<T, 'schema'>, 'schemas'>

// TODO: Should we just accept "schema"/"schemas" here and infer that they mean "payload_schemas"?
export type XyoBoundWitnessDivinerPredicate = WithoutSchema<XyoPayloadDivinerPredicate & Partial<XyoBoundWitnessWithMeta & XyoPayloadWithMeta>>
