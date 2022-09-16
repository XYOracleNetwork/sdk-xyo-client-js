import { XyoQuery } from '../Query'

export type XyoModuleDiscoverQuerySchema = 'network.xyo.query.module.discover'
export const XyoModuleDiscoverQuerySchema: XyoModuleDiscoverQuerySchema = 'network.xyo.query.module.discover'

export type XyoModuleDiscoverQuery = XyoQuery<{
  schema: XyoModuleDiscoverQuerySchema
}>
