import { assertEx } from '@xylabs/assert'
import { Address, isAddress } from '@xylabs/hex'
import { AbstractBridgeModuleResolver, BridgeModuleResolverOptions, wrapModuleWithType } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { ModuleConfig, ModuleConfigSchema, ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'

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
      config: { schema: ModuleConfigSchema },
      host: this.options.bridge,
      moduleAddress: firstPart as Address,
    }
    const proxy = new AsyncQueryBusModuleProxy<T, AsyncQueryBusModuleProxyParams>(params)
    if (proxy) {
      const state = await proxy.state()
      if (state) {
        const configSchema = (state.find((payload) => payload.schema === ConfigSchema) as ConfigPayload | undefined)?.config
        const config = assertEx(
          state.find((payload) => payload.schema === configSchema),
          () => 'Unable to locate config',
        ) as ModuleConfig
        proxy.setConfig(config)
      }
    }
    await proxy.start?.()
    const wrappedProxy = wrapModuleWithType(proxy, account) as unknown as T
    this.add(wrappedProxy)
    return remainderParts.length > 0 ? await proxy.resolve(remainderParts, options) : wrappedProxy
  }
}
