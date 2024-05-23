import { assertEx } from '@xylabs/assert'
import { Address, isAddress } from '@xylabs/hex'
import { Account } from '@xyo-network/account'
import { AbstractBridgeModuleResolver, BridgeModuleResolverParams, wrapModuleWithType } from '@xyo-network/bridge-abstract'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import {
  asModuleInstance,
  ModuleConfig,
  ModuleConfigSchema,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ResolveHelper,
} from '@xyo-network/module-model'
import { Mutex } from 'async-mutex'
import { LRUCache } from 'lru-cache'

import { AsyncQueryBusClient, AsyncQueryBusModuleProxy, AsyncQueryBusModuleProxyParams } from './AsyncQueryBus'

export interface PubSubBridgeModuleResolverParams extends BridgeModuleResolverParams {
  busClient: AsyncQueryBusClient
}

export class PubSubBridgeModuleResolver extends AbstractBridgeModuleResolver<PubSubBridgeModuleResolverParams> {
  protected _resolvedCache = new LRUCache<Address, ModuleInstance>({ max: 1000 })
  protected _resolvedCacheMutex = new Mutex()

  override async resolveHandler<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T[]> {
    const parentResult = await super.resolveHandler(id, options)
    if (parentResult.length > 0) {
      return parentResult
    }
    const idParts = id.split(':')
    const untransformedFirstPart = assertEx(idParts.shift(), () => 'Missing module identifier')
    const firstPart = await ResolveHelper.transformModuleIdentifier(untransformedFirstPart)
    assertEx(isAddress(firstPart), () => `Invalid module address: ${firstPart}`)
    const remainderParts = idParts.join(':')
    const instance: T = await this._resolvedCacheMutex.runExclusive(async () => {
      const cachedMod = this._resolvedCache.get(firstPart as Address)
      if (cachedMod) {
        const result = idParts.length <= 0 ? cachedMod : cachedMod.resolve(remainderParts, { ...options, maxDepth: (options?.maxDepth ?? 5) - 1 })
        return result as T
      }
      const account = Account.randomSync()
      const finalParams: AsyncQueryBusModuleProxyParams = {
        account,
        archiving: this.params.archiving,
        busClient: this.params.busClient,
        config: { schema: ModuleConfigSchema },
        host: this,
        moduleAddress: firstPart as Address,
        onQuerySendFinished: this.params.onQuerySendFinished,
        onQuerySendStarted: this.params.onQuerySendStarted,
      }
      const proxy = new AsyncQueryBusModuleProxy<T, AsyncQueryBusModuleProxyParams>(finalParams)
      const state = await proxy.state()
      if (state) {
        const configSchema = (state.find((payload) => payload.schema === ConfigSchema) as ConfigPayload | undefined)?.config
        const config = assertEx(
          state.find((payload) => payload.schema === configSchema),
          () => 'Unable to locate config',
        ) as ModuleConfig
        proxy.setConfig(config)
      }
      await proxy.start?.()
      const wrapped = wrapModuleWithType(proxy, account) as unknown as T
      assertEx(asModuleInstance<T>(wrapped, {}), () => `Failed to asModuleInstance [${id}]`)
      this._resolvedCache.set(wrapped.address, wrapped)
      return wrapped as ModuleInstance as T
    })
    const result = remainderParts.length > 0 ? await instance.resolve(remainderParts, options) : instance
    return result ? [result] : []
  }
}
