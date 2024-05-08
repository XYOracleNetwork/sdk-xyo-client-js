import { AccountInstance } from '@xyo-network/account-model'
import { BridgeInstance, QueryFinishedEventArgs, QueryStartedEventArgs } from '@xyo-network/bridge-model'
import { CacheConfig, ModuleFilterOptions, ModuleIdentifier, ModuleInstance, ObjectResolverPriority } from '@xyo-network/module-model'
import { CompositeModuleResolver, ModuleResolverParams } from '@xyo-network/module-resolver'

import { ModuleProxyParams } from './AbstractModuleProxy'

export interface BridgeModuleResolverParams extends ModuleResolverParams {
  bridge: BridgeInstance
  cacheConfig?: CacheConfig
  onQueryFinished?: (args: Exclude<QueryFinishedEventArgs, 'module'>) => void
  onQueryStarted?: (args: Exclude<QueryStartedEventArgs, 'module'>) => void
  wrapperAccount: AccountInstance
}

export abstract class AbstractBridgeModuleResolver<
  TParams extends BridgeModuleResolverParams = BridgeModuleResolverParams,
  TProxyParams extends ModuleProxyParams = ModuleProxyParams,
> extends CompositeModuleResolver<TParams> {
  override get priority() {
    return ObjectResolverPriority.VeryLow
  }
  override async resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
    _params?: Partial<TProxyParams>,
  ): Promise<T | T[] | undefined> {
    if (id === '*') {
      return []
    }
    const result = (await super.resolveHandler(id, options)) as T | undefined
    return result
  }
}
