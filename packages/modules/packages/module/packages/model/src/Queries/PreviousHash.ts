import { Query } from '../Query'

export type ModuleAccountQuerySchema = 'network.xyo.query.module.account.hash.previous'
export const ModuleAccountQuerySchema: ModuleAccountQuerySchema = 'network.xyo.query.module.account.hash.previous'

export type ModuleAccountQuery = Query<{
  schema: ModuleAccountQuerySchema
}>
