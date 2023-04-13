import { Query } from '../Query'

export type ModulePreviousHashQuerySchema = 'network.xyo.query.module.previoushash'
export const ModulePreviousHashQuerySchema: ModulePreviousHashQuerySchema = 'network.xyo.query.module.previoushash'

export type ModulePreviousHashQuery = Query<{
  schema: ModulePreviousHashQuerySchema
}>
