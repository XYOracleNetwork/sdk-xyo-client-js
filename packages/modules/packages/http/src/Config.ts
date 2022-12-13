import { AbstractModuleConfig } from '@xyo-network/module'

export type HttpProxyModuleConfigSchema = 'network.xyo.module.remote.config'
export const HttpProxyModuleConfigSchema: HttpProxyModuleConfigSchema = 'network.xyo.module.remote.config'

export type HttpProxyModuleConfig = AbstractModuleConfig & {
  archive?: string
  schema: HttpProxyModuleConfigSchema
}
