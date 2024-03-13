/* eslint-disable complexity */
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Promisable } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { isArchivistModule } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import {
  BridgeConfigSchema,
  BridgeConnectedQuerySchema,
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
  BridgeExposeOptions,
  BridgeExposeQuerySchema,
  BridgeInstance,
  BridgeParams,
  BridgeQueries,
  BridgeUnexposeOptions,
  BridgeUnexposeQuerySchema,
  ModuleFilterPayload,
  ModuleFilterPayloadSchema,
} from '@xyo-network/bridge-model'
import { isDivinerModule } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import {
  isAddressModuleFilter,
  isNameModuleFilter,
  Module,
  ModuleEventData,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryHandlerResult,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { isNodeModule } from '@xyo-network/node-model'
import { NodeWrapper } from '@xyo-network/node-wrapper'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { isSentinelModule } from '@xyo-network/sentinel-model'
import { SentinelWrapper } from '@xyo-network/sentinel-wrapper'
import { isWitnessModule } from '@xyo-network/witness-model'
import { WitnessWrapper } from '@xyo-network/witness-wrapper'
import { LRUCache } from 'lru-cache'

// const moduleIdentifierParts = (moduleIdentifier: ModuleIdentifier): ModuleIdentifierPart[] => {
//   return moduleIdentifier?.split(':') as ModuleIdentifierPart[]
// }

const wrapModuleWithType = (module: Module, account: AccountInstance): ModuleWrapper => {
  if (isArchivistModule(module)) {
    return ArchivistWrapper.wrap(module, account)
  }
  if (isDivinerModule(module)) {
    return DivinerWrapper.wrap(module, account)
  }
  if (isNodeModule(module)) {
    return NodeWrapper.wrap(module, account)
  }
  if (isSentinelModule(module)) {
    return SentinelWrapper.wrap(module, account)
  }
  if (isWitnessModule(module)) {
    return WitnessWrapper.wrap(module, account)
  }
  throw 'Failed to wrap'
}

export abstract class AbstractBridge<TParams extends BridgeParams = BridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractModuleInstance<TParams, TEventData>
  implements BridgeInstance<TParams, TEventData>
{
  static override readonly configSchemas: string[] = [BridgeConfigSchema]

  private _cache?: LRUCache<ModuleIdentifier, ModuleInstance>

  get cache() {
    this._cache =
      this._cache ??
      (() => {
        const { max = 100, ttl = 1000 * 60 * 5 /* five minutes */, ...cache } = this.config.resolveCache ?? {}
        return new LRUCache<ModuleIdentifier, ModuleInstance>({ max, ttl, ...cache })
      })()
    return this._cache
  }

  override get queries(): string[] {
    return [BridgeConnectQuerySchema, BridgeDisconnectQuerySchema, BridgeExposeQuerySchema, BridgeUnexposeQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<BridgeQueries['schema'], string> {
    return {
      'network.xyo.query.bridge.connect': '1/1',
      'network.xyo.query.bridge.connected': '1/3',
      'network.xyo.query.bridge.disconnect': '1/2',
      'network.xyo.query.bridge.expose': '1/4',
      'network.xyo.query.bridge.unexpose': '1/5',
    }
  }

  connect(): Promisable<boolean> {
    this._noOverride('connect')
    throw new Error('Unsupported')
  }

  disconnect(): Promisable<boolean> {
    this._noOverride('disconnect')
    throw new Error('Unsupported')
  }

  expose(id: string, options?: BridgeExposeOptions | undefined): Promisable<Lowercase<string>[]> {
    this._noOverride('expose')
    return this.exposeHandler(id, options)
  }

  override async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter?: ModuleFilter<T> | ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const direction = options?.direction ?? 'all'
    if (typeof idOrFilter === 'string') {
      if (direction === 'all' || direction === 'down') {
        const downResolve = await (this.downResolver as CompositeModuleResolver).resolve<T>(idOrFilter)
        if (downResolve) return downResolve
      }
      if (direction === 'all' || direction === 'up') {
        const upResolve = await this.upResolver.resolve<T>(idOrFilter)
        if (upResolve) return upResolve
      }
      const cachedResult = this.cache.get(idOrFilter)
      if (cachedResult) {
        if (cachedResult.status === 'dead') {
          this.cache.delete(idOrFilter)
        } else {
          return cachedResult as T
        }
      }
      const module = await this.resolveHandler<T>(idOrFilter)
      await module?.start?.()
      const result = module ? (wrapModuleWithType(module, this.account) as unknown as T) : undefined
      if (result) {
        this.cache.set(idOrFilter, result)
      }
      return result
    } else if (idOrFilter === undefined) {
      if (direction === 'all' || direction === 'down') {
        const downResolve = await (this.downResolver as CompositeModuleResolver).resolve<T>(idOrFilter, options)
        if (downResolve) return downResolve
      }
      if (direction === 'all' || direction === 'up') {
        const upResolve = await this.upResolver.resolve<T>(idOrFilter, options)
        if (upResolve) return upResolve
      }
    } else {
      const filter = idOrFilter
      if (isAddressModuleFilter(filter)) {
        return (await Promise.all(filter.address.map((item) => this.resolve(item, options)))).filter(exists)
      } else if (isNameModuleFilter(filter)) {
        return (await Promise.all(filter.name.map((item) => this.resolve(item, options)))).filter(exists)
      }
    }
  }

  unexpose(id: string, options?: BridgeUnexposeOptions | undefined): Promisable<Lowercase<string>[]> {
    this._noOverride('unexpose')
    return this.unexposeHandler(id, options)
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness>(
    query: T,
    payloads?: Payload[],
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<BridgeQueries>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    const resultPayloads: Payload[] = []

    switch (queryPayload.schema) {
      case BridgeConnectQuerySchema: {
        await this.connect()
        break
      }
      case BridgeConnectedQuerySchema: {
        resultPayloads.push({ connected: await this.connect(), schema: 'network.xyo.bridge.connected' } as Payload)
        break
      }
      case BridgeDisconnectQuerySchema: {
        await this.disconnect()
        break
      }
      case BridgeExposeQuerySchema: {
        const filterPayloads = (payloads ?? []).filter(isPayloadOfSchemaType<ModuleFilterPayload>(ModuleFilterPayloadSchema))
        assertEx(filterPayloads, 'At least one filter is required')

        await Promise.all(
          filterPayloads.map(async (filter) => {
            const { id, ...options } = filter
            const addresses = await this.expose(id, options)
            addresses.map((address) => {
              const addressPayload: AddressPayload = {
                address,
                schema: AddressSchema,
              }
              resultPayloads.push(addressPayload)
            })
          }),
        )
        break
      }
      case BridgeUnexposeQuerySchema: {
        const filterPayloads = (payloads ?? []).filter(isPayloadOfSchemaType<ModuleFilterPayload>(ModuleFilterPayloadSchema))
        assertEx(filterPayloads, 'At least one filter is required')

        await Promise.all(
          filterPayloads.map(async (filter) => {
            const { id, ...options } = filter
            const addresses = await this.unexpose(id, options)
            addresses.map((address) => {
              const addressPayload: AddressPayload = {
                address,
                schema: AddressSchema,
              }
              resultPayloads.push(addressPayload)
            })
          }),
        )
        break
      }
      default: {
        return await super.queryHandler(query, payloads)
      }
    }
    return resultPayloads
  }

  abstract exposeHandler(id: ModuleIdentifier, options?: BridgeExposeOptions | undefined): Promisable<Lowercase<string>[]>

  abstract resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promisable<T | undefined>

  abstract unexposeHandler(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promisable<Lowercase<string>[]>
}
