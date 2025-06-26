import type { BaseParams } from '@xylabs/base'
import type { AccountInstance } from '@xyo-network/account-model'
import type { AttachableModuleInstance, Module, ModuleParams } from '@xyo-network/module-model'

export type ModuleWrapperParams<TModule extends AttachableModuleInstance = AttachableModuleInstance> = BaseParams<{
  account: AccountInstance
  additionalSigners?: AccountInstance[]
  mod: TModule
}>
