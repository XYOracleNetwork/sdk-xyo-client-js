import { AccountInstance } from '@xyo-network/account-model'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { CacheConfig } from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'

export interface BridgeModuleResolverOptions {
  bridge: BridgeInstance
  cacheConfig?: CacheConfig
  wrapperAccount: AccountInstance
}

export abstract class AbstractBridgeModuleResolver<
  T extends BridgeModuleResolverOptions = BridgeModuleResolverOptions,
> extends CompositeModuleResolver {
  constructor(protected options: T) {
    super()
  }
}
