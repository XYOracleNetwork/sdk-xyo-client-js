import { XyoQuery } from '../Query'

export type AbstractModuleDiscoverQuerySchema = 'network.xyo.query.module.discover'
export const AbstractModuleDiscoverQuerySchema: AbstractModuleDiscoverQuerySchema = 'network.xyo.query.module.discover'

export type AbstractModuleDiscoverQuery = XyoQuery<{
  schema: AbstractModuleDiscoverQuerySchema
}>
