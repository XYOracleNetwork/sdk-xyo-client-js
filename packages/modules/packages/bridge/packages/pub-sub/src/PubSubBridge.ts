import { assertEx } from '@xylabs/assert'
import { forget } from '@xylabs/forget'
import { Address, isAddress } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { Account } from '@xyo-network/account'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeModule } from '@xyo-network/bridge-model'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  creatableModule,
  ModuleConfig,
  ModuleConfigSchema,
  ModuleEventData,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { NodeAttachQuerySchema } from '@xyo-network/node-model'
import { Payload } from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import {
  AsyncQueryBusClient,
  AsyncQueryBusClientParams,
  AsyncQueryBusHost,
  AsyncQueryBusModuleProxy,
  AsyncQueryBusModuleProxyParams,
} from './AsyncQueryBus'
import { PubSubBridgeConfigSchema } from './Config'
import { PubSubBridgeParams } from './Params'

const moduleName = 'PubSubBridge'

@creatableModule()
export class PubSubBridge<TParams extends PubSubBridgeParams = PubSubBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override configSchemas = [PubSubBridgeConfigSchema]

  protected _configRootAddress: Address = ''
  protected _configStateStoreArchivist: string = ''
  protected _configStateStoreBoundWitnessDiviner: string = ''
  protected _lastState?: LRUCache<string, number>

  private _busClient?: AsyncQueryBusClient
  private _busHost?: AsyncQueryBusHost

  protected get moduleName() {
    return `${this.config.name ?? moduleName}`
  }

  protected get rootAddress() {
    return this._configRootAddress
  }

  connect() {
    this.connected = true
    return this.connected
  }

  async disconnect(): Promise<boolean> {
    await Promise.resolve()
    this.connected = false
    return true
  }

  override getRootAddress(): Address {
    return this.rootAddress
  }

  override async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter?: ModuleFilter<T> | ModuleIdentifier,
    _options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    if (idOrFilter === undefined) {
      return []
    }
    if (typeof idOrFilter === 'string') {
      const upResolve = await this.upResolver.resolve<T>(idOrFilter)
      if (upResolve) return upResolve
      assertEx(!isAddress(idOrFilter), 'Name resolutions not supported')
      const params: AsyncQueryBusModuleProxyParams = {
        account: Account.randomSync(),
        busClient: assertEx(this.busClient(), 'Bus client not initialized'),
        moduleAddress: idOrFilter as Address,
        queries: [],
      }
      // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
      return await Promise.resolve(new AsyncQueryBusModuleProxy<T>(params) as unknown as T)
    } else {
      throw new TypeError('Filter not Supported')
    }
  }

  override targetConfig(_address: Address): ModuleConfig {
    return { schema: ModuleConfigSchema }
  }

  override targetManifest(_address: Address, _maxDepth?: number | undefined): Promisable<ModuleManifestPayload> {
    return { config: { name: '', schema: ModuleConfigSchema }, schema: ModuleManifestPayloadSchema }
  }

  override targetQueries(_address: Address): string[] {
    return []
  }

  override async targetQuery(address: Address, query: QueryBoundWitness, payloads?: Payload[] | undefined): Promise<ModuleQueryResult> {
    if (!this.connected) throw new Error('Not connected')
    await this.started('throw')
    const bus = assertEx(this.busClient(), 'Client not configured')
    return bus?.send(address, query, payloads)
  }

  override targetQueryable(_address: Address, _query: QueryBoundWitness, _payloads?: Payload[], _queryConfig?: ModuleConfig): boolean {
    return true
  }

  protected busClient() {
    if (!this._busClient && this.config.client) {
      this._busClient = new AsyncQueryBusClient({
        config: this.config.client,
        logger: this.logger,
        resolver: this,
      })
    }
    return this._busClient
  }

  protected busHost() {
    if (!this._busHost && this.config.host) {
      this._busHost = new AsyncQueryBusHost({
        config: this.config.host,
        logger: this.logger,
        resolver: this,
      })
    }
    return this._busHost
  }

  protected override async startHandler(): Promise<boolean> {
    await Promise.resolve(this.connect())
    this.busHost()?.start()
    return true
  }

  protected override stopHandler(_timeout?: number | undefined) {
    this.busHost()?.stop()
    return true
  }
}
