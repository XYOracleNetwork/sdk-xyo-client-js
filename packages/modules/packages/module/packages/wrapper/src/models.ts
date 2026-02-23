import type { BaseParams } from '@xylabs/sdk-js'
import type { AccountInstance } from '@xyo-network/account-model'
import type { QueryableModule } from '@xyo-network/module-model'

export type ModuleWrapperParams<TWrappedModule extends QueryableModule = QueryableModule> = BaseParams<{
  account: AccountInstance
  additionalSigners?: AccountInstance[]
  mod: TWrappedModule
}>
