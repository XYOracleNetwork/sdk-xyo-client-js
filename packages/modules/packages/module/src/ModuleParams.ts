import { Account } from '@xyo-network/account'
import { AbstractModuleConfig } from '@xyo-network/module-model'
import { Logger } from '@xyo-network/shared'

import { CompositeModuleResolver } from './Resolver'

export interface ModuleParams<TConfig extends AbstractModuleConfig = AbstractModuleConfig> {
  account?: Account
  config: TConfig
  logger?: Logger
  resolver?: CompositeModuleResolver
}
