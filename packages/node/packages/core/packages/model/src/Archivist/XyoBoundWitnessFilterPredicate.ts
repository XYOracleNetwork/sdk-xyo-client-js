import { XyoBoundWitnessWithMeta } from '../BoundWitness'
import { XyoPayloadWithMeta } from '../Payload'
import { XyoPayloadFilterPredicate } from './XyoPayloadFilterPredicate'

type WithoutSchema<T> = Omit<Omit<T, 'schema'>, 'schemas'>

// TODO: Should we just accept "schema"/"schemas" here and infer that they mean "payload_schemas"?
export type XyoBoundWitnessFilterPredicate = WithoutSchema<XyoPayloadFilterPredicate> & Partial<XyoBoundWitnessWithMeta & XyoPayloadWithMeta>
