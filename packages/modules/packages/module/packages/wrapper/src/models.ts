import { AccountInstance } from '@xyo-network/account-model'
import { Module } from '@xyo-network/module-model'
import { BaseParams } from '@xyo-network/object'

export type ModuleWrapperParams<TWrappedModule extends Module = Module> = BaseParams<{
  account: AccountInstance
  module: TWrappedModule
}>
