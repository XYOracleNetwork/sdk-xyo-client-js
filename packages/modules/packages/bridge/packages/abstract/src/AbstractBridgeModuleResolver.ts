import type { AccountInstance } from '@xyo-network/account-model'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import type {
  BridgeInstance, QuerySendFinishedEventArgs, QuerySendStartedEventArgs,
} from '@xyo-network/bridge-model'
import type {
  ArchivingModuleConfig,
  CacheConfig,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
} from '@xyo-network/module-model'
import { ObjectResolverPriority } from '@xyo-network/module-model'
import type { ModuleResolverParams } from '@xyo-network/module-resolver'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'

import type { ModuleProxyParams } from './AbstractModuleProxy/index.ts'

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
