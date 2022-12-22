import { Account } from '@xyo-network/account'
import { AbstractModuleConfig, ModuleResolver } from '@xyo-network/module-model'
import { Logger } from '@xyo-network/shared'

export interface ModuleParams<TConfig extends AbstractModuleConfig = AbstractModuleConfig> {
  account?: Account
  config: TConfig
  logger?: Logger
  resolver?: ModuleResolver
}
