import { assertEx } from '@xylabs/assert'
import { Address, isAddress } from '@xylabs/hex'
import { AbstractBridgeModuleResolver, BridgeModuleResolverParams, wrapModuleWithType } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { asModuleInstance, ModuleConfig, ModuleConfigSchema, ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'

import { BridgeQuerySender, HttpModuleProxy, HttpModuleProxyParams } from './ModuleProxy'

export interface HttpBridgeModuleResolverParams extends BridgeModuleResolverParams {
  querySender: BridgeQuerySender
  rootUrl: string
}

export class HttpBridgeModuleResolver<
  T extends HttpBridgeModuleResolverParams = HttpBridgeModuleResolverParams,
> extends AbstractBridgeModuleResolver<T> {
  get querySender() {
    return this.params.querySender
  }

  moduleUrl(address: Address) {
    return new URL(address, this.params.rootUrl)
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
    const params: HttpModuleProxyParams = {
      account: Account.randomSync(),
      config: { schema: ModuleConfigSchema },
      host: this,
      moduleAddress,
      querySender: this.querySender,
    }

    //console.log(`creating HttpProxy [${moduleAddress}] ${id}`)

    const proxy = new HttpModuleProxy<T, HttpModuleProxyParams>(params)
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
    proxy.downResolver.add(as)

    if (remainderParts.length > 0) {
      const result = await wrapped.resolve<T>(remainderParts, options)
      return result
    }

    //console.log(`resolved: ${proxy.address} [${wrapped.constructor.name}] [${as.constructor.name}]`)
    return as
  }
}
