import { AccountInstance } from '@xyo-network/account-model'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { CacheConfig, ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'
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

  override async resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    if (id === '*') {
      return []
    }
    const result = (await super.resolveHandler(id, options)) as T | undefined
    return result
  }
}
