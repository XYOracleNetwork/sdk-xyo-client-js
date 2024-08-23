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
  isModuleInstance,
  ModuleConfigSchema,
  ResolveHelper,
} from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'
import { LRUCache } from 'lru-cache'

import type { BridgeQuerySender, HttpModuleProxyParams } from './ModuleProxy/index.ts'
import { HttpModuleProxy } from './ModuleProxy/index.ts'

const NotFoundModule = { notFound: true }

export interface HttpBridgeModuleResolverParams extends BridgeModuleResolverParams {
  querySender: BridgeQuerySender
  rootUrl: string
}

export class HttpBridgeModuleResolver<
  T extends HttpBridgeModuleResolverParams = HttpBridgeModuleResolverParams,
> extends AbstractBridgeModuleResolver<T> {
  protected _resolvedCache = new LRUCache<Address, ModuleInstance | typeof NotFoundModule>({ max: 1000 })
  protected _resolvedCacheMutex = new Mutex()

  get querySender() {
    return this.params.querySender
  }

  moduleUrl(address: Address) {
    return new URL(address, this.params.rootUrl)
  }

  override async resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
    params?: Partial<HttpModuleProxyParams>,
  ): Promise<T[]> {
    const parentResult = await super.resolveHandler(id, options)
    if (parentResult.length > 0) {
      return parentResult
    }
    const idParts = id.split(':')
    const untransformedFirstPart = assertEx(idParts.shift(), () => 'Missing module identifier')
    const firstPart = await ResolveHelper.transformModuleIdentifier(untransformedFirstPart)
    assertEx(isAddress(firstPart), () => `Invalid module address: ${firstPart}`)
    const remainderParts = idParts.join(':')
    const instance: T | undefined = await this._resolvedCacheMutex.runExclusive(async () => {
      const cachedMod = this._resolvedCache.get(firstPart as Address)
      if (cachedMod) {
        if (isModuleInstance(cachedMod)) {
          const result = idParts.length <= 0 ? cachedMod : cachedMod.resolve(remainderParts, { ...options, maxDepth: (options?.maxDepth ?? 5) - 1 })
          return result as T
        } else {
          // return cached 404
          return
        }
      }
      const account = await Account.random()
      const finalParams: HttpModuleProxyParams = {
        account,
        archiving: this.params.archiving,
        config: { schema: ModuleConfigSchema },
        host: this,
        moduleAddress: firstPart as Address,
        onQuerySendFinished: this.params.onQuerySendFinished,
        onQuerySendStarted: this.params.onQuerySendStarted,
        querySender: this.params.querySender,
        ...params,
      }

      this.logger?.debug(`creating HttpProxy [${firstPart}] ${id}`)

      const proxy = new HttpModuleProxy<T, HttpModuleProxyParams>(finalParams)

      let state: Payload[] | undefined

      try {
        state = await proxy.state()
      } catch (ex) {
        const error = ex as Error
        this.logger?.log(error.message)
      }

      if (!state) {
        // cache the fact that it was not found
        this._resolvedCache.set(firstPart as Address, NotFoundModule)
        return
      }

      const configSchema = (state.find(payload => payload.schema === ConfigSchema) as ConfigPayload | undefined)?.config
      const config = assertEx(
        state.find(payload => payload.schema === configSchema),
        () => 'Unable to locate config',
      ) as ModuleConfig
      proxy.setConfig(config)

      this.logger?.log(`created HttpProxy [${firstPart}] ${proxy.id}`)

      await proxy.start?.()
      const wrapped = wrapModuleWithType(proxy, account) as unknown as T
      assertEx(asModuleInstance<T>(wrapped, {}), () => `Failed to asModuleInstance [${id}]`)
      this._resolvedCache.set(wrapped.address, wrapped)
      return wrapped as ModuleInstance as T
    })
    const result = remainderParts.length > 0 ? await instance?.resolve(remainderParts, options) : instance
    return result ? [result] : []
  }
}
