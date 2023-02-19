import { ModuleConfig } from '@xyo-network/module'

export type HttpProxyModuleConfigSchema = 'network.xyo.module.remote.config'
export const HttpProxyModuleConfigSchema: HttpProxyModuleConfigSchema = 'network.xyo.module.remote.config'

export type HttpProxyModuleConfig = ModuleConfig & {
  address?: string
  archive?: string
  schema: HttpProxyModuleConfigSchema
}
