import { Query } from '@xyo-network/payload-model'

export type ModuleDiscoverQuerySchema = 'network.xyo.query.module.discover'
export const ModuleDiscoverQuerySchema: ModuleDiscoverQuerySchema = 'network.xyo.query.module.discover'

export type ModuleDiscoverQuery = Query<{
  maxDepth?: number
  schema: ModuleDiscoverQuerySchema
}>
