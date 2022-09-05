import { XyoModuleConfig } from '../Config'
import { XyoQueryPayload } from './Query'

export type XyoModuleInitializeQueryPayloadSchema = 'network.xyo.query.module.initialize'
export const XyoModuleInitializeQueryPayloadSchema: XyoModuleInitializeQueryPayloadSchema = 'network.xyo.query.module.initialize'

export type XyoModuleInitializeQueryPayload = XyoQueryPayload<{
  schema: XyoModuleInitializeQueryPayloadSchema
  config?: XyoModuleConfig
}>
