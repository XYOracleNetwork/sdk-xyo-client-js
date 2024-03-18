import { Address } from '@xylabs/hex'
import { AbstractBridgeModuleResolver, BridgeModuleResolverOptions } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'

import { AsyncQueryBusClient, AsyncQueryBusModuleProxy, AsyncQueryBusModuleProxyParams } from './AsyncQueryBus'

export interface PubSubBridgeModuleResolverOptions extends BridgeModuleResolverOptions {
  busClient: AsyncQueryBusClient
}

export class PubSubBridgeModuleResolver<
  T extends PubSubBridgeModuleResolverOptions = PubSubBridgeModuleResolverOptions,
> extends AbstractBridgeModuleResolver<T> {
  async resolveHandler<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined> {
    const idParts = id.split(':')
    const firstPart = idParts.shift()
    const remainderParts = idParts.join(':')
    const account = Account.randomSync()
    const params: AsyncQueryBusModuleProxyParams = {
      account,
      bridge: this.options.bridge,
      busClient: this.options.busClient,
      moduleAddress: firstPart as Address,
    }
    const proxy = new AsyncQueryBusModuleProxy<T>(params) as unknown as T
    return remainderParts.length > 0 ? await proxy.resolve(remainderParts, options) : proxy
  }
}
