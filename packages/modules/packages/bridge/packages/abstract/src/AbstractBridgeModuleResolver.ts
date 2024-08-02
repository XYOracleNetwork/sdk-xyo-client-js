import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { BridgeInstance, QuerySendFinishedEventArgs, QuerySendStartedEventArgs } from '@xyo-network/bridge-model'
import {
  ArchivingModuleConfig,
  CacheConfig,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ObjectResolverPriority,
} from '@xyo-network/module-model'
import { CompositeModuleResolver, ModuleResolverParams } from '@xyo-network/module-resolver'

import { ModuleProxyParams } from './AbstractModuleProxy/index.ts'

export interface BridgeModuleResolverParams extends ModuleResolverParams {
  additionalSigners?: AccountInstance[]
  archiving?: ArchivingModuleConfig['archiving'] & { resolveArchivists: () => Promise<ArchivistInstance[]> }
  bridge: BridgeInstance
  cacheConfig?: CacheConfig
  onQuerySendFinished?: (args: Omit<QuerySendFinishedEventArgs, 'mod'>) => void
  onQuerySendStarted?: (args: Omit<QuerySendStartedEventArgs, 'mod'>) => void
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
  ): Promise<T[]> {
    if (id === '*') {
      return []
    }
    return await super.resolveHandler(id, options)
  }
}
