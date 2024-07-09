import { assertEx } from '@xylabs/assert'
import { AxiosError, AxiosJson } from '@xylabs/axios'
import { exists } from '@xylabs/exists'
import { forget } from '@xylabs/forget'
import { Address, isAddress } from '@xylabs/hex'
import { toJsonString } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
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
import { ModuleManifestPayload, NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  AddressPayload,
  AddressSchema,
  AnyConfigSchema,
  creatableModule,
  isAddressModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryResult,
  ModuleResolverInstance,
  ModuleStateQuery,
  ModuleStateQuerySchema,
  resolveAddressToInstance,
  ResolveHelper,
} from '@xyo-network/module-model'
import { asAttachableNodeInstance, asNodeInstance } from '@xyo-network/node-model'
import { isPayloadOfSchemaType, Payload, Schema, WithMeta } from '@xyo-network/payload-model'
import { Mutex, Semaphore } from 'async-mutex'
import { LRUCache } from 'lru-cache'

import { HttpBridgeConfig, HttpBridgeConfigSchema } from './HttpBridgeConfig'
import { HttpBridgeModuleResolver } from './HttpBridgeModuleResolver'
import { BridgeQuerySender } from './ModuleProxy'

export interface HttpBridgeParams extends BridgeParams<AnyConfigSchema<HttpBridgeConfig>> {
  axios?: AxiosJson
}

@creatableModule()
export class HttpBridgeBase<TParams extends HttpBridgeParams> extends AbstractBridge<TParams> implements BridgeModule<TParams>, BridgeQuerySender {
  static axios = new AxiosJson()
  static override readonly configSchemas: Schema[] = [...super.configSchemas, HttpBridgeConfigSchema]
  static override readonly defaultConfigSchema: Schema = HttpBridgeConfigSchema
  static defaultFailureRetryTime = 1000 * 60
  static defaultMaxConnections = 4
  static defaultMaxPayloadSizeWarning = 256 * 256
  static maxFailureCacheSize = 1000

  private _axios?: AxiosJson
  private _discoverRootsMutex = new Mutex()
  private _failureTimeCache = new LRUCache<Address, number>({ max: HttpBridgeBase.maxFailureCacheSize })
  private _querySemaphore?: Semaphore
  private _resolver?: HttpBridgeModuleResolver

  get axios() {
    this._axios = this._axios ?? this.params.axios ?? HttpBridgeBase.axios
    return this._axios
  }

  get clientUrl() {
    // eslint-disable-next-line deprecation/deprecation
    return assertEx(this.config.client?.url ?? this.config.nodeUrl, () => 'No Url Set')
  }

  get failureRetryTime() {
    return this.config.failureRetryTime ?? HttpBridgeBase.defaultFailureRetryTime
  }

  get maxConnections() {
    return this.config.maxConnections ?? HttpBridgeBase.defaultMaxConnections
  }

  get maxPayloadSizeWarning() {
    return this.config.maxPayloadSizeWarning ?? HttpBridgeBase.defaultMaxPayloadSizeWarning
  }

  get querySemaphore() {
    this._querySemaphore = this._querySemaphore ?? new Semaphore(this.maxConnections)
    return this._querySemaphore
  }

  override get resolver() {
    this._resolver =
      this._resolver ??
      new HttpBridgeModuleResolver({
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

  async connect(id: ModuleIdentifier, maxDepth = 5): Promise<Address | undefined> {
    const transformedId = assertEx(await ResolveHelper.transformModuleIdentifier(id), () => `Unable to transform module identifier: ${id}`)
    //check if already connected
    const existingInstance = await this.resolve<ModuleInstance>(transformedId)
    if (existingInstance) {
      return existingInstance.address
    }

    //use the resolver to create the proxy instance
    const [instance] = await this.resolver.resolveHandler<ModuleInstance>(id)
    return await this.connectInstance(instance, maxDepth)
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
        const nodeManifest = state?.find(isPayloadOfSchemaType<WithMeta<NodeManifestPayload>>(NodeManifestPayloadSchema))
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

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(): Promise<ModuleInstance[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  /** @deprecated use '*' if trying to resolve all */
  override async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter, options?: ModuleFilterOptions<T>): Promise<T[]>

  override async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const roots = (this._roots ?? []) as T[]
    const workingSet = (options.direction === 'up' ? [this as ModuleInstance] : [...roots, this]) as T[]
    if (idOrFilter === '*') {
      const remainingDepth = (options.maxDepth ?? 1) - 1
      return remainingDepth <= 0 ? workingSet
          // TODO: resolveAddressToInstance here to iterate over workingSet public children of down resolver
          // TODO: Add resolveAll helper in https://github.com/XYOracleNetwork/sdk-xyo-client-js/tree/797a7a0693b831037ebbb519c4be9b749d035d38/packages/modules/packages/module/packages/model/src/ResolveHelper
        : [...workingSet, ...(await Promise.all(roots.map((mod) => mod.resolve('*', { ...options, maxDepth: remainingDepth })))).flat()]
    }
    switch (typeof idOrFilter) {
      case 'string': {
        const parts = idOrFilter.split(':')
        const first = assertEx(parts.shift(), () => 'Missing first part')
        const firstInstance: ModuleInstance | undefined =
          isAddress(first) ?
            ((await resolveAddressToInstance(this, first, undefined, [], options.direction)) as T)
          : this._roots?.find((mod) => mod.id === first)
        return (parts.length === 0 ? firstInstance : firstInstance?.resolve(parts.join(':'), options)) as T | undefined
      }
      case 'object': {
        const results: T[] = []
        if (isAddressModuleFilter(idOrFilter)) {
          for (const mod of workingSet) {
            if (mod.modName && idOrFilter.address.includes(mod.address)) results.push(mod as T)
          }
        }
        return results
      }
      default: {
        return
      }
    }
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
      this.logger?.error(`Error: ${toJsonString(error)}`)
      throw error
    } finally {
      this.querySemaphore.release()
    }
  }

  override unexposeHandler(_id: string, _options?: BridgeUnexposeOptions | undefined): Promisable<ModuleInstance[]> {
    throw new Error('Unsupported')
  }

  protected async connectInstance(instance?: ModuleInstance, maxDepth = 5): Promise<Address | undefined> {
    if (instance) {
      this.downResolver.add(instance)
      await this.getRoots(true)
      if (maxDepth > 0) {
        const node = asNodeInstance(instance)
        if (node) {
          const state = await node.state()
          const children = (state?.filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema)).map((s) => s.address) ?? []).filter(
            (a) => a !== instance.address,
          )
          await Promise.all(children.map((child) => this.connect(child, maxDepth - 1)))
        }
      }
      this.logger?.log(`Connect: ${instance.id}`)
      return instance.address
    }
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
      this.logger.debug(`rootNode: ${rootNode.id}`)
      this.downResolver.addResolver(rootNode as unknown as ModuleResolverInstance)
      return [rootNode]
    }
    return []
  }
}
