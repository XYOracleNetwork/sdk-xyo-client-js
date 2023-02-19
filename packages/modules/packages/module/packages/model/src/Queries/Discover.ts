import { XyoQuery } from '../Query'

export type ModuleDiscoverQuerySchema = 'network.xyo.query.module.discover'
export const ModuleDiscoverQuerySchema: ModuleDiscoverQuerySchema = 'network.xyo.query.module.discover'

export type ModuleDiscoverQuery = XyoQuery<{
  schema: ModuleDiscoverQuerySchema
}>
