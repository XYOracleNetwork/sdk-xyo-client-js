import {
  Address, assertEx,
  axiosJsonConfig,
  exists,
  forget,
  Promisable, toSafeJsonString,
} from '@xylabs/sdk-js'
import { ApiEnvelope } from '@xyo-network/api-models'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractBridge } from '@xyo-network/bridge-abstract'
import {
  BridgeExposeOptions,
  BridgeModule,
  BridgeParams,
  BridgeUnexposeOptions,
  QuerySendFinishedEventArgs,
  QuerySendStartedEventArgs,
} from '@xyo-network/bridge-model'
import {
  ModuleManifestPayload, NodeManifestPayload, NodeManifestPayloadSchema,
} from '@xyo-network/manifest-model'
import {
  AnyConfigSchema,
  creatableModule,
  ModuleInstance,
  ModuleQueryResult,
  ModuleResolverInstance,
  ModuleStateQuery,
  ModuleStateQuerySchema,
} from '@xyo-network/module-model'
import { asAttachableNodeInstance } from '@xyo-network/node-model'
import {
  isPayloadOfSchemaType, Payload, Schema,
} from '@xyo-network/payload-model'
import { Mutex, Semaphore } from 'async-mutex'
import { Axios, AxiosError } from 'axios'
import { LRUCache } from 'lru-cache'

import { HttpBridgeConfig, HttpBridgeConfigSchema } from './HttpBridgeConfig.ts'
import { HttpBridgeModuleResolver } from './HttpBridgeModuleResolver.ts'
import { BridgeQuerySender } from './ModuleProxy/index.ts'

export interface HttpBridgeParams extends BridgeParams<AnyConfigSchema<HttpBridgeConfig>> {
  axios?: Axios
}

@creatableModule()
export class HttpBridge<TParams extends HttpBridgeParams> extends AbstractBridge<TParams> implements BridgeModule<TParams>, BridgeQuerySender {
  static readonly axios = new Axios(axiosJsonConfig())
  static override readonly configSchemas: Schema[] = [...super.configSchemas, HttpBridgeConfigSchema]
  static override readonly defaultConfigSchema: Schema = HttpBridgeConfigSchema
  static readonly defaultFailureRetryTime = 1000 * 60
  static readonly defaultMaxConnections = 4
  static readonly defaultMaxPayloadSizeWarning = 256 * 256
  static readonly maxFailureCacheSize = 1000

  private _axios?: Axios
  private _discoverRootsMutex = new Mutex()
  private _failureTimeCache = new LRUCache<Address, number>({ max: HttpBridge.maxFailureCacheSize })
  private _querySemaphore?: Semaphore
  private _resolver?: HttpBridgeModuleResolver

  get axios() {
    this._axios = this._axios ?? this.params.axios ?? HttpBridge.axios
    return this._axios
  }

  get clientUrl() {
    return assertEx(this.config.client?.url ?? this.config.nodeUrl, () => 'No Url Set')
  }

  get failureRetryTime() {
    return this.config.failureRetryTime ?? HttpBridge.defaultFailureRetryTime
  }

  get maxConnections() {
    return this.config.maxConnections ?? HttpBridge.defaultMaxConnections
  }

  get maxPayloadSizeWarning() {
    return this.config.maxPayloadSizeWarning ?? HttpBridge.defaultMaxPayloadSizeWarning
  }

  get querySemaphore() {
    this._querySemaphore = this._querySemaphore ?? new Semaphore(this.maxConnections)
    return this._querySemaphore
  }

  override get resolver() {
    this._resolver
      = this._resolver
        ?? new HttpBridgeModuleResolver({
          additionalSigners: this.additionalSigners,
          archiving: { ...this.archiving, resolveArchivists: this.resolveArchivingArchivists.bind(this) },
          bridge: this,
          onQuerySendFinished: (args: Omit<QuerySendFinishedEventArgs, 'mod'>) => {
            forget(this.emit('querySendFinished', { mod: this, ...args }))
          },
          onQuerySendStarted: (args: Omit<QuerySendStartedEventArgs, 'mod'>) => {
            forget(this.emit('querySendStarted', { mod: this, ...args }))
          },
          querySender: this,
          root: this,
          rootUrl: this.clientUrl,
          wrapperAccount: this.account,
        })
    return this._resolver
  }

  override exposeHandler(_id: string, _options?: BridgeExposeOptions | undefined): Promisable<ModuleInstance[]> {
    throw new Error('Unsupported')
  }

  override exposedHandler(): Promisable<Address[]> {
    throw new Error('Unsupported')
  }

  async getRoots(force?: boolean): Promise<ModuleInstance[]> {
    return await this._discoverRootsMutex.runExclusive(async () => {
      if (this._roots === undefined || force) {
        const state = await this.getRootState()
        this.logger?.debug(`HttpBridge:discoverRoots.state [${state?.length}]`)
        const nodeManifest = state?.find(isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema))
        if (nodeManifest) {
          const mods = (await this.resolveRootNode(nodeManifest)).filter(exists)
          this.logger?.debug(`HttpBridge:discoverRoots [${mods.length}]`)
          this._roots = mods
        } else {
          this._roots = []
        }
      }
      return this._roots
    })
  }

  moduleUrl(address: Address) {
    return new URL(address, this.clientUrl)
  }

  async sendBridgeQuery<TOut extends Payload = Payload, TQuery extends QueryBoundWitness = QueryBoundWitness, TIn extends Payload = Payload>(
    targetAddress: Address,
    query: TQuery,
    payloads?: TIn[],
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
      const payloadSize = JSON.stringify([query, payloads]).length
      if (payloadSize > this.maxPayloadSizeWarning) {
        this.logger?.warn(
          `Large targetQuery being sent: ${payloadSize} bytes [${this.address}][${this.moduleAddress}] [${query.schema}] [${payloads?.length}]`,
        )
      }
      const moduleUrl = this.moduleUrl(targetAddress).href
      const result = await this.axios.post<ApiEnvelope<ModuleQueryResult<TOut>>>(moduleUrl, [query, payloads])
      if (result.status === 404) {
        throw `target module not found [${moduleUrl}] [${result.status}]`
      }
      if (result.status >= 400) {
        this.logger?.error(`targetQuery failed [${moduleUrl}]`)
        throw `targetQuery failed [${moduleUrl}] [${result.status}]`
      }
      return result.data?.data
    } catch (ex) {
      const error = ex as AxiosError
      this.logger?.error(`Error: ${toSafeJsonString(error)}`)
      throw error
    } finally {
      this.querySemaphore.release()
    }
  }

  override unexposeHandler(_id: string, _options?: BridgeUnexposeOptions | undefined): Promisable<ModuleInstance[]> {
    throw new Error('Unsupported')
  }

  private async getRootState() {
    const queryPayload: ModuleStateQuery = { schema: ModuleStateQuerySchema }
    const boundQuery = await this.bindQuery(queryPayload)
    try {
      const response = await this.axios.post<ApiEnvelope<ModuleQueryResult>>(this.clientUrl.toString(), boundQuery)
      if (response.status === 404) {
        return []
      }
      const [, payloads, errors] = response.data.data
      if (errors.length > 0) {
        throw new Error(`getRootState failed: ${JSON.stringify(errors, null, 2)}`)
      }
      return payloads
    } catch (ex) {
      const error = ex as Error
      this.logger?.warn(`Unable to connect to remote node: ${error.message} [${this.clientUrl}]`)
    }
  }

  private async resolveRootNode(nodeManifest: ModuleManifestPayload): Promise<ModuleInstance[]> {
    const rootModule = assertEx(
      (
        await this.resolver.resolveHandler(
          assertEx(nodeManifest.status?.address, () => 'Root has no address'),
          undefined,
          { manifest: nodeManifest },
        )
      ).at(0),
      () => `Root not found [${nodeManifest.status?.address}]`,
    )
    assertEx(rootModule.constructor.name !== 'HttpModuleProxy', () => 'rootModule is not a Wrapper')
    const rootNode = asAttachableNodeInstance(rootModule, 'Root modules is not a node')
    if (rootNode) {
      this.logger?.debug(`rootNode: ${rootNode.id}`)
      this.downResolver.addResolver(rootNode as unknown as ModuleResolverInstance)
      return [rootNode]
    }
    return []
  }
}
