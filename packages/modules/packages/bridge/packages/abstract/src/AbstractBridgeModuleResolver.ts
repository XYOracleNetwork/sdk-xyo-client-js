import { AccountInstance } from '@xyo-network/account-model'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { CacheConfig, ModuleFilterOptions, ModuleIdentifier, ModuleInstance, ObjectResolverPriority } from '@xyo-network/module-model'
import { CompositeModuleResolver, ModuleResolverParams } from '@xyo-network/module-resolver'

export interface BridgeModuleResolverParams extends ModuleResolverParams {
  bridge: BridgeInstance
  cacheConfig?: CacheConfig
  wrapperAccount: AccountInstance
}

export abstract class AbstractBridgeModuleResolver<
  T extends BridgeModuleResolverParams = BridgeModuleResolverParams,
> extends CompositeModuleResolver<T> {
  override get priority() {
    return ObjectResolverPriority.VeryLow
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
