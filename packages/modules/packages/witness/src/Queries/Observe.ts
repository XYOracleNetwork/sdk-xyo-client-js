import { Query } from '@xyo-network/module-model'

export type WitnessObserveQuerySchema = 'network.xyo.query.witness.observe'
export const WitnessObserveQuerySchema: WitnessObserveQuerySchema = 'network.xyo.query.witness.observe'

export type WitnessObserveQuery = Query<{
  payloads?: string[]
  schema: WitnessObserveQuerySchema
}>
