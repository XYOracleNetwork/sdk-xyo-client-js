import { XyoQueryPayload } from '../Query'

export type XyoModuleShutdownQueryPayloadSchema = 'network.xyo.query.module.shutdown'
export const XyoModuleShutdownQueryPayloadSchema: XyoModuleShutdownQueryPayloadSchema = 'network.xyo.query.module.shutdown'

export type XyoModuleShutdownQueryPayload = XyoQueryPayload<{
  schema: XyoModuleShutdownQueryPayloadSchema
}>
