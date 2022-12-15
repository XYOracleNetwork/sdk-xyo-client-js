import { Account } from '@xyo-network/account'
import { Logger } from '@xyo-network/shared'

import { AbstractModuleConfig } from '../Config'
import { ModuleResolver } from './ModuleResolver'

export interface ModuleParams<TConfig extends AbstractModuleConfig = AbstractModuleConfig> {
  account?: Account
  config: TConfig
  logger?: Logger
  resolver?: ModuleResolver
}
