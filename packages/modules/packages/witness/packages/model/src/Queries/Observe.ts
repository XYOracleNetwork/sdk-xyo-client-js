import type { Query } from '@xyo-network/payload-model'

export const WitnessObserveQuerySchema = 'network.xyo.query.witness.observe' as const
export type WitnessObserveQuerySchema = typeof WitnessObserveQuerySchema

export type WitnessObserveQuery = Query<{
  payloads?: string[]
  schema: WitnessObserveQuerySchema
}>
