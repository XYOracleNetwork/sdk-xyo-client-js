import { Query } from '@xyo-network/payload-model'

export type DivinerDivineQuerySchema = 'network.xyo.query.diviner.divine'
export const DivinerDivineQuerySchema: DivinerDivineQuerySchema = 'network.xyo.query.diviner.divine'

export type DivinerDivineQuery = Query<{
  schema: DivinerDivineQuerySchema
}>
