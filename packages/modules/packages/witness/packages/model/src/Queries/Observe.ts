import { asSchema, type Query } from '@xyo-network/payload-model'

export const WitnessObserveQuerySchema = asSchema('network.xyo.query.witness.observe', true)
export type WitnessObserveQuerySchema = typeof WitnessObserveQuerySchema

export type WitnessObserveQuery = Query<{
  payloads?: string[]
  schema: WitnessObserveQuerySchema
}>
