import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractBridge } from '@xyo-network/bridge-abstract'
import { BridgeExposeOptions, BridgeModule, BridgeUnexposeOptions } from '@xyo-network/bridge-model'
import { creatableModule, ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
import { Payload, Schema } from '@xyo-network/payload-model'
import { Semaphore } from 'async-mutex'
import { LRUCache } from 'lru-cache'

import { WebsocketBridgeConfigSchema } from './Config.js'
import { WebsocketBridgeQuerySender } from './ModuleProxy/index.js'
import { WebsocketBridgeParams } from './Params.js'
import { WebsocketBridgeModuleResolver } from './WebsocketBridgeModuleResolver.js'

@creatableModule()
export class WebsocketClientBridge<TParams extends WebsocketBridgeParams = WebsocketBridgeParams>
  extends AbstractBridge<TParams>
  implements BridgeModule<TParams>, WebsocketBridgeQuerySender
{
  static override readonly configSchemas: Schema[] = [...super.configSchemas, WebsocketBridgeConfigSchema]
  static override readonly defaultConfigSchema: Schema = WebsocketBridgeConfigSchema
  static defaultFailureRetryTime = 1000 * 60
  static defaultMaxConnections = 4
  static defaultMaxPayloadSizeWarning = 256 * 256
  static maxFailureCacheSize = 1000

  private _failureTimeCache = new LRUCache<Address, number>({ max: WebsocketClientBridge.maxFailureCacheSize })
  private _querySemaphore?: Semaphore

  private _resolver?: WebsocketBridgeModuleResolver

  get client() {
    return this.config.client
  }

  get failureRetryTime() {
    return this.client?.failureRetryTime ?? WebsocketClientBridge.defaultFailureRetryTime
  }

  get maxConnections() {
    return this.client?.maxConnections ?? WebsocketClientBridge.defaultMaxConnections
  }

  get maxPayloadSizeWarning() {
    return this.client?.maxPayloadSizeWarning ?? WebsocketClientBridge.defaultMaxPayloadSizeWarning
  }

  get querySemaphore() {
    this._querySemaphore = this._querySemaphore ?? new Semaphore(this.maxConnections)
    return this._querySemaphore
  }

  override get resolver() {
    this._resolver =
      this._resolver ??
      new WebsocketBridgeModuleResolver({
        archiving: { ...this.archiving, resolveArchivists: this.resolveArchivingArchivists.bind(this) },
        bridge: this,
        querySender: this,
        root: this,
        wrapperAccount: this.account,
      })
    return this._resolver
  }

  get url() {
    return assertEx(this.config.client?.url, () => 'No Url Set')
  }

  override exposeHandler(_id: string, _options?: BridgeExposeOptions | undefined): Promisable<ModuleInstance[]> {
    throw new Error('Unsupported')
  }

  override exposedHandler(): Promisable<Address[]> {
    throw new Error('Unsupported')
  }

  async getRoots(): Promise<ModuleInstance[]> {
    return await Promise.resolve([])
  }

  async sendBridgeQuery<TOut extends Payload = Payload, TQuery extends QueryBoundWitness = QueryBoundWitness, TIn extends Payload = Payload>(
    targetAddress: Address,
    _query: TQuery,
    _payloads?: TIn[],
  ): Promise<ModuleQueryResult<TOut>> {
    const lastFailureTime = this._failureTimeCache.get(targetAddress)
    if (lastFailureTime !== undefined) {
      const now = Date.now()
      const timeSincePreviousFailure = now - lastFailureTime
      if (timeSincePreviousFailure > this.failureRetryTime) {
        throw new Error(`target module failed recently [${targetAddress}] [${timeSincePreviousFailure}ms ago]`)
      }
      this._failureTimeCache.delete(targetAddress)
    }
    try {
      await this.querySemaphore.acquire()
      throw new Error('Unsupported')
    } catch (ex) {
      const error = ex as Error
      throw error
    } finally {
      this.querySemaphore.release()
    }
  }

  override unexposeHandler(_id: string, _options?: BridgeUnexposeOptions | undefined): Promisable<ModuleInstance[]> {
    throw new Error('Unsupported')
  }
}
