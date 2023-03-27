import { AccountInstance } from '@xyo-network/account-model'
import { BaseParams } from '@xyo-network/core'
import { Module } from '@xyo-network/module-model'

export type ModuleWrapperParams<TWrappedModule extends Module = Module> = BaseParams<{
  account?: AccountInstance
  module: TWrappedModule
}>
