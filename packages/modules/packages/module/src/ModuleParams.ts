import { Account } from '@xyo-network/account'
import { ModuleConfig } from '@xyo-network/module-model'
import { Logger } from '@xyo-network/shared'

import { CompositeModuleResolver } from './Resolver'

export interface ModuleParams<TConfig extends ModuleConfig = ModuleConfig> {
  account?: Account
  config: TConfig
  logger?: Logger
  resolver?: CompositeModuleResolver
}
