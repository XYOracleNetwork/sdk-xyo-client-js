import { XyoModuleConfig } from '@xyo-network/module'

export type HttpProxyModuleConfigSchema = 'network.xyo.module.remote.config'
export const HttpProxyModuleConfigSchema: HttpProxyModuleConfigSchema = 'network.xyo.module.remote.config'

export type HttpProxyModuleConfig = XyoModuleConfig & {
  archive?: string
  schema: HttpProxyModuleConfigSchema
}
