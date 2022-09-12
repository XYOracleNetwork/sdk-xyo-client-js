import { XyoQuery } from '../Query'

export type XyoModuleShutdownQuerySchema = 'network.xyo.query.module.shutdown'
export const XyoModuleShutdownQuerySchema: XyoModuleShutdownQuerySchema = 'network.xyo.query.module.shutdown'

export type XyoModuleShutdownQuery = XyoQuery<{
  schema: XyoModuleShutdownQuerySchema
}>
