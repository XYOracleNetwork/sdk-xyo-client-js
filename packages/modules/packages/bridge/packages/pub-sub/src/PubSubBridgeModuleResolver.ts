import { assertEx } from '@xylabs/assert'
import { Address, isAddress } from '@xylabs/hex'
import { AbstractBridgeModuleResolver, BridgeModuleResolverOptions, wrapModuleWithType } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'

import { AsyncQueryBusClient, AsyncQueryBusModuleProxy, AsyncQueryBusModuleProxyParams } from './AsyncQueryBus'

export interface PubSubBridgeModuleResolverOptions extends BridgeModuleResolverOptions {
  busClient: AsyncQueryBusClient
}

export class PubSubBridgeModuleResolver extends AbstractBridgeModuleResolver<PubSubBridgeModuleResolverOptions> {
  override async resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const parentResult = await super.resolveHandler(id, options)
    if (parentResult) {
      return parentResult
    }
    const idParts = id.split(':')
    const firstPart = idParts.shift()
    assertEx(isAddress(firstPart), () => `Invalid module address: ${firstPart}`)
    const remainderParts = idParts.join(':')
    const account = Account.randomSync()
    const params: AsyncQueryBusModuleProxyParams = {
      account,
      busClient: this.options.busClient,
      host: this.options.bridge,
      moduleAddress: firstPart as Address,
    }
    const proxy = new AsyncQueryBusModuleProxy<T>(params) as unknown as T
    await proxy.start?.()
    const wrappedProxy = wrapModuleWithType(proxy, account) as unknown as T
    this.add(wrappedProxy)
    return remainderParts.length > 0 ? await proxy.resolve(remainderParts, options) : wrappedProxy
  }
}
