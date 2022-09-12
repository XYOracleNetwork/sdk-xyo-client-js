import { XyoModuleConfig } from '../Config'
import { XyoQuery } from '../Query'

export type XyoModuleInitializeQuerySchema = 'network.xyo.query.module.initialize'
export const XyoModuleInitializeQuerySchema: XyoModuleInitializeQuerySchema = 'network.xyo.query.module.initialize'

export type XyoModuleInitializeQuery = XyoQuery<{
  schema: XyoModuleInitializeQuerySchema
  config?: XyoModuleConfig
}>
