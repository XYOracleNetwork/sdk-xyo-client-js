import { Query } from '../Query'

export type ModuleAccountQuerySchema = 'network.xyo.query.module.account'
export const ModuleAccountQuerySchema: ModuleAccountQuerySchema = 'network.xyo.query.module.account'

export type ModuleAccountQuery = Query<{
  schema: ModuleAccountQuerySchema
}>
