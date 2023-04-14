import { Query } from '../Query'

export type ModulePreviousHashQuerySchema = 'network.xyo.query.module.account.hash.previous'
export const ModulePreviousHashQuerySchema: ModulePreviousHashQuerySchema = 'network.xyo.query.module.account.hash.previous'

export type ModulePreviousHashQuery = Query<{
  schema: ModulePreviousHashQuerySchema
}>
