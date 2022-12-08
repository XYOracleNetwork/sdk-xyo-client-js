import { XyoModuleConfig } from '@xyo-network/module'

export type XyoRemoteModuleConfigSchema = 'network.xyo.module.remote.config'
export const XyoRemoteModuleConfigSchema: XyoRemoteModuleConfigSchema = 'network.xyo.module.remote.config'

export type XyoRemoteModuleConfig = XyoModuleConfig & {
  archive?: string
  schema: XyoRemoteModuleConfigSchema
}
