import { assertEx } from '@xylabs/assert'
import { compact } from '@xylabs/lodash'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { ApiEnvelope } from '@xyo-network/api-models'
import { AxiosError, AxiosJson } from '@xyo-network/axios'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeModule, CacheConfig } from '@xyo-network/bridge-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { ManifestPayload, ManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  AnyConfigSchema,
  creatableModule,
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleEventData,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleParams,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { NodeAttachQuerySchema } from '@xyo-network/node-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { LRUCache } from 'lru-cache'
import Url from 'url-parse'

import { HttpBridgeConfig, HttpBridgeConfigSchema } from './HttpBridgeConfig'

export type HttpBridgeParams<TConfig extends AnyConfigSchema<HttpBridgeConfig> = AnyConfigSchema<HttpBridgeConfig>> = ModuleParams<TConfig>

@creatableModule()
export class HttpBridge<TParams extends HttpBridgeParams = HttpBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override configSchemas = [HttpBridgeConfigSchema]
  static maxPayloadSizeWarning = 256 * 256

  private _axios?: AxiosJson
  private _discoverCache?: LRUCache<string, Payload[]>
  private _rootAddress?: string
  private _targetConfigs: Record<string, ModuleConfig> = {}
  private _targetQueries: Record<string, string[]> = {}

  get axios() {
    this._axios = this._axios ?? new AxiosJson()
    return this._axios
  }

  get discoverCache() {
    const config = this.discoverCacheConfig
    this._discoverCache = this._discoverCache ?? new LRUCache<string, Payload[]>({ ttlAutopurge: true, ...config })
    return this._discoverCache
  }

  get discoverCacheConfig(): LRUCache.Options<string, Payload[], unknown> {
    const discoverCacheConfig: CacheConfig | undefined = this.config.discoverCache === true ? {} : this.config.discoverCache
    return { max: 100, ttl: 1000 * 60 * 5, ...discoverCacheConfig }
  }

  get nodeUrl() {
    return new Url(this.config?.nodeUrl ?? '/')
  }

  async connect(): Promise<boolean> {
    // const start = Date.now()
    await super.startHandler()
    const rootAddress = await this.initRootAddress()
    if (rootAddress) {
      this.connected = true
      const rootTargetDownResolver = this.targetDownResolver()
      if (rootTargetDownResolver) {
        this.downResolver.addResolver(rootTargetDownResolver)
        await this.targetDiscover(rootAddress)

        const childAddresses = await rootTargetDownResolver.getRemoteAddresses()

        const children = compact(
          await Promise.all(
            childAddresses.map(async (address) => {
              const resolved = await rootTargetDownResolver.resolve({ address: [address] })
              return resolved[0]
            }),
          ),
        )

        // Discover all to load cache
        await Promise.all(children.map((child) => assertEx(child.discover())))

        const parentNodes = await this.upResolver.resolve({ query: [[NodeAttachQuerySchema]] })
        //notify parents of child modules
        //TODO: this needs to be thought through. If this the correct direction for data flow and how do we 'un-attach'?
        parentNodes.forEach((node) => children.forEach((child) => node.emit('moduleAttached', { module: child })))
        // console.log(`Started HTTP Bridge in ${Date.now() - start}ms`)
        return true
      } else {
        this.connected = false
        return false
      }
    } else {
      this.connected = false
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    const rootTargetDownResolver = this.targetDownResolver()
    if (rootTargetDownResolver) {
      this.downResolver.removeResolver(rootTargetDownResolver)
      const children = await rootTargetDownResolver.resolve()
      const parentNodes = await this.upResolver.resolve({ query: [[NodeAttachQuerySchema]] })
      await Promise.all(
        parentNodes.map(async (node) => {
          await Promise.all(
            children.map(async (child) => {
              await node.emit('moduleDetached', { module: child })
            }),
          )
        }),
      )
      rootTargetDownResolver.reset()
    }
    this._rootAddress = undefined
    this.connected = false
    return true
  }

  async getRootAddress() {
    await this.started('throw')
    if (this._rootAddress) {
      return this._rootAddress
    }
    throw Error('rootAddress not set')
  }

  moduleUrl(address: string) {
    return new URL(address, this.nodeUrl.toString())
  }

  targetConfig(address: string): ModuleConfig {
    return assertEx(this._targetConfigs[address], `targetConfig not set [${address}]`)
  }

  async targetDiscover(address?: string): Promise<Payload[]> {
    if (!this.connected) {
      throw Error('Not connected')
    }
    //if caching, return cached result if exists
    const cachedResult = this.discoverCache?.get(address ?? 'root ')
    if (cachedResult) {
      return cachedResult
    }
    await this.started('throw')
    const addressToDiscover = address ?? (await this.getRootAddress())
    const queryPayload: ModuleDiscoverQuery = { schema: ModuleDiscoverQuerySchema }
    const boundQuery = await this.bindQuery(queryPayload)
    const discover = assertEx(await this.targetQuery(addressToDiscover, boundQuery[0], boundQuery[1]), `Unable to resolve [${address}]`)[1]

    this._targetQueries[addressToDiscover] = compact(
      discover?.map((payload) => {
        if (payload.schema === QuerySchema) {
          const schemaPayload = payload as QueryPayload
          return schemaPayload.query
        } else {
          return null
        }
      }) ?? [],
    )

    const targetConfigSchema = assertEx(
      discover.find((payload) => payload.schema === ConfigSchema) as ConfigPayload,
      `Discover did not return a [${ConfigSchema}] payload`,
    ).config

    this._targetConfigs[addressToDiscover] = assertEx(
      discover.find((payload) => payload.schema === targetConfigSchema) as ModuleConfig,
      `Discover did not return a [${targetConfigSchema}] payload`,
    )

    //if caching, set entry
    this.discoverCache?.set(address ?? 'root', discover)

    return discover
  }

  async targetManifest(address: string, maxDepth?: number) {
    const addressToCall = address ?? (await this.getRootAddress())
    const queryPayload: ModuleManifestQuery = { maxDepth, schema: ModuleManifestQuerySchema }
    const boundQuery = await this.bindQuery(queryPayload)
    const manifest = assertEx(await this.targetQuery(addressToCall, boundQuery[0], boundQuery[1]), `Unable to resolve [${address}]`)[1]
    return assertEx(manifest.find(isPayloadOfSchemaType(ManifestPayloadSchema)), 'Did not receive manifest') as ManifestPayload
  }

  targetQueries(address: string): string[] {
    if (!this.connected) {
      throw Error('Not connected')
    }
    return assertEx(this._targetQueries[address], `targetQueries not set [${address}]`)
  }

  async targetQuery(address: string, query: QueryBoundWitness, payloads: Payload[] = []): Promise<ModuleQueryResult> {
    if (!this.connected) {
      throw Error('Not connected')
    }
    await this.started('throw')
    try {
      const moduleUrlString = this.moduleUrl(address).toString()
      const payloadSize = JSON.stringify([query, payloads]).length
      if (payloadSize > HttpBridge.maxPayloadSizeWarning) {
        this.logger?.warn(`Large targetQuery being sent: ${payloadSize} bytes [${address}] [${query.schema}] [${payloads.length}]`)
      }
      const result = await this.axios.post<ApiEnvelope<ModuleQueryResult>>(moduleUrlString, [query, payloads])
      if (result.status === 404) {
        throw `target module not found [${moduleUrlString}] [${result.status}]`
      }
      if (result.status >= 400) {
        this.logger?.error(`targetQuery failed [${moduleUrlString}]`)
        throw `targetQuery failed [${moduleUrlString}] [${result.status}]`
      }
      return result.data?.data
    } catch (ex) {
      const error = ex as AxiosError
      this.logger?.error(`Error Status: ${error.status}`)
      this.logger?.error(`Error Cause: ${JSON.stringify(error.cause, null, 2)}`)
      throw error
    }
  }

  targetQueryable(_address: string, _query: QueryBoundWitness, _payloads?: Payload[], _queryConfig?: ModuleConfig): boolean {
    return true
  }

  protected override async startHandler() {
    await this.connect()
    return true
  }

  private async initRootAddress() {
    const queryPayload: ModuleDiscoverQuery = { schema: ModuleDiscoverQuerySchema }
    const boundQuery = await this.bindQuery(queryPayload)
    try {
      const response = await this.axios.post<ApiEnvelope<ModuleQueryResult>>(this.nodeUrl.toString(), boundQuery)
      this._rootAddress = AxiosJson.finalPath(response)
    } catch (ex) {
      const error = ex as Error
      this.logger?.warn(`Unable to connect to remote node: ${error.message}`)
    }
    return this._rootAddress
  }
}
