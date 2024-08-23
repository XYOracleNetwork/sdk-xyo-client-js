import { assertEx } from '@xylabs/assert'
import type { Address } from '@xylabs/hex'
import { isAddress } from '@xylabs/hex'
import { Account } from '@xyo-network/account'
import type { BridgeModuleResolverParams } from '@xyo-network/bridge-abstract'
import { AbstractBridgeModuleResolver, wrapModuleWithType } from '@xyo-network/bridge-abstract'
import type { ConfigPayload } from '@xyo-network/config-payload-plugin'
import { ConfigSchema } from '@xyo-network/config-payload-plugin'
import type {
  ModuleConfig,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
} from '@xyo-network/module-model'
import {
  asModuleInstance,
  ModuleConfigSchema,
  ResolveHelper,
} from '@xyo-network/module-model'

import type { WebsocketBridgeQuerySender, WebsocketModuleProxyParams } from './ModuleProxy/index.ts'
import { WebsocketModuleProxy } from './ModuleProxy/index.ts'

export interface WebsocketBridgeModuleResolverParams extends BridgeModuleResolverParams {
  querySender: WebsocketBridgeQuerySender
}

export class WebsocketBridgeModuleResolver<
  T extends WebsocketBridgeModuleResolverParams = WebsocketBridgeModuleResolverParams,
> extends AbstractBridgeModuleResolver<T> {
  get querySender() {
    return this.params.querySender
  }

  override async resolveHandler<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T[]> {
    const parentResult = await super.resolveHandler(id, options)
    if (parentResult) {
      return parentResult
    }
    if (id === '*') {
      return []
    }
    const idParts = id.split(':')
    const untransformedFirstPart = assertEx(idParts.shift(), () => `Invalid module identifier: ${id}`)
    const firstPart = await ResolveHelper.transformModuleIdentifier(untransformedFirstPart)
    const moduleAddress = firstPart as Address
    assertEx(isAddress(firstPart), () => `Invalid module address: ${firstPart}`)
    const remainderParts = idParts.join(':')
    const params: WebsocketModuleProxyParams = {
      account: await Account.random(),
      config: { schema: ModuleConfigSchema },
      host: this,
      moduleAddress,
      querySender: this.querySender,
    }

    this.logger?.debug(`creating HttpProxy [${moduleAddress}] ${id}`)

    const proxy = new WebsocketModuleProxy<T, WebsocketModuleProxyParams>(params)
    // calling state here to get the config
    if (proxy) {
      const state = await proxy.state()
      if (state) {
        const configSchema = (state.find(payload => payload.schema === ConfigSchema) as ConfigPayload | undefined)?.config
        const config = assertEx(
          state.find(payload => payload.schema === configSchema),
          () => 'Unable to locate config',
        ) as ModuleConfig
        proxy.setConfig(config)
      }
    }

    await proxy.start()

    const wrapped = assertEx(wrapModuleWithType(proxy, await Account.random()) as unknown as T, () => `Failed to wrapModuleWithType [${id}]`)
    const instance = assertEx(asModuleInstance<T>(wrapped, {}), () => `Failed to asModuleInstance [${id}]`)
    proxy.upResolver.add(instance)
    proxy.downResolver.add(instance)

    if (remainderParts.length > 0) {
      const result = await wrapped.resolve<T>(remainderParts, options)
      return result ? [result] : []
    }

    // console.log(`resolved: ${proxy.address} [${wrapped.constructor.name}] [${as.constructor.name}]`)
    return [instance]
  }
}
