import { asSchema, type Query } from '@xyo-network/payload-model'

export const DivinerDivineQuerySchema = asSchema('network.xyo.query.diviner.divine', true)
export type DivinerDivineQuerySchema = typeof DivinerDivineQuerySchema

export type DivinerDivineQuery = Query<{
  schema: DivinerDivineQuerySchema
}>
