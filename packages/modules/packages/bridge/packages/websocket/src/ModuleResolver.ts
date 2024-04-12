import { assertEx } from '@xylabs/assert'
import { Address, isAddress } from '@xylabs/hex'
import { AbstractBridgeModuleResolver, BridgeModuleResolverParams, wrapModuleWithType } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { asModuleInstance, ModuleConfig, ModuleConfigSchema, ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'
import { SimpleModuleResolver } from '@xyo-network/module-resolver'

import { WebsocketModuleProxy, WebsocketModuleProxyParams } from './ModuleProxy'

export interface WebsocketBridgeModuleResolverOptions extends BridgeModuleResolverParams {
  url: string
}

export class WebsocketBridgeModuleResolver<
  T extends WebsocketBridgeModuleResolverOptions = WebsocketBridgeModuleResolverOptions,
> extends AbstractBridgeModuleResolver<T> {
  moduleUrl(address: Address) {
    return new URL(address, this.params.url)
  }

  override async resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const parentResult = await super.resolveHandler(id, options)
    if (parentResult) {
      return parentResult
    }
    if (id === '*') {
      return []
    }
    const idParts = id.split(':')
    const firstPart = assertEx(idParts.shift(), () => 'Missing firstPart')
    const moduleAddress = firstPart as Address
    assertEx(isAddress(firstPart), () => `Invalid module address: ${firstPart}`)
    const remainderParts = idParts.join(':')
    const params: WebsocketModuleProxyParams = {
      account: Account.randomSync(),
      config: { schema: ModuleConfigSchema },
      host: this,
      moduleAddress,
      moduleUrl: this.moduleUrl(moduleAddress).href,
    }

    //console.log(`creating WebsocketProxy [${moduleAddress}] ${id}`)

    const proxy = new WebsocketModuleProxy<T, WebsocketModuleProxyParams>(params)
    //calling state here to get the config
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

    await proxy.start()

    const wrapped = assertEx(wrapModuleWithType(proxy, Account.randomSync()) as unknown as T, () => `Failed to wrapModuleWithType [${id}]`)
    const as = assertEx(asModuleInstance<T>(wrapped, {}), () => `Failed to asModuleInstance [${id}]`)
    proxy.upResolver.add(as)
    ;(proxy.downResolver as SimpleModuleResolver).add(as)

    if (remainderParts.length > 0) {
      const result = await wrapped.resolve<T>(remainderParts, options)
      return result
    }

    //console.log(`resolved: ${proxy.address} [${wrapped.constructor.name}] [${as.constructor.name}]`)
    return as
  }
}
