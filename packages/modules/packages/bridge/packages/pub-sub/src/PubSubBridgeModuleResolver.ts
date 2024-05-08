import { assertEx } from '@xylabs/assert'
import { Address, isAddress } from '@xylabs/hex'
import { AbstractBridgeModuleResolver, BridgeModuleResolverParams, wrapModuleWithType } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { asModuleInstance, ModuleConfig, ModuleConfigSchema, ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'

import { AsyncQueryBusClient, AsyncQueryBusModuleProxy, AsyncQueryBusModuleProxyParams } from './AsyncQueryBus'

export interface PubSubBridgeModuleResolverParams extends BridgeModuleResolverParams {
  busClient: AsyncQueryBusClient
}

export class PubSubBridgeModuleResolver extends AbstractBridgeModuleResolver<PubSubBridgeModuleResolverParams> {
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
    const finalParams: AsyncQueryBusModuleProxyParams = {
      account,
      busClient: this.params.busClient,
      config: { schema: ModuleConfigSchema },
      host: this.params.bridge,
      moduleAddress: firstPart as Address,
      onQueryFinished: this.params.onQueryFinished,
      onQueryStarted: this.params.onQueryStarted,
    }
    const proxy = new AsyncQueryBusModuleProxy<T, AsyncQueryBusModuleProxyParams>(finalParams)
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
    const wrapped = wrapModuleWithType(proxy, account) as unknown as T
    const as = assertEx(asModuleInstance<T>(wrapped, {}), () => `Failed to asModuleInstance [${id}]`)
    proxy.upResolver.add(as)
    proxy.downResolver.add(as)
    this.add(as)
    return remainderParts.length > 0 ? await proxy.resolve(remainderParts, options) : as
  }
}
