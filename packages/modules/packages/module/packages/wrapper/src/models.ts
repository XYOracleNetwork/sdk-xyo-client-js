import type { BaseParams } from '@xylabs/base'
import type { AccountInstance } from '@xyo-network/account-model'
import type { Module } from '@xyo-network/module-model'

export type ModuleWrapperParams<TWrappedModule extends Module = Module> = BaseParams<{
  account: AccountInstance
  additionalSigners?: AccountInstance[]
  mod: TWrappedModule
}>
