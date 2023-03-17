import { XyoBoundWitnessWithMeta } from '../BoundWitness'
import { PayloadWithMeta } from '../Payload'
import { PayloadFilterPredicate } from './PayloadFilterPredicate'

type WithoutSchema<T> = Omit<Omit<T, 'schema'>, 'schemas'>

// TODO: Should we just accept "schema"/"schemas" here and infer that they mean "payload_schemas"?
export type XyoBoundWitnessFilterPredicate = WithoutSchema<PayloadFilterPredicate> & Partial<XyoBoundWitnessWithMeta & PayloadWithMeta>
