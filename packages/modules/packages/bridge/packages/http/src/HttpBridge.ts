import { assertEx } from '@xylabs/assert'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { ApiEnvelope } from '@xyo-network/api-models'
import { AxiosError, AxiosJson } from '@xyo-network/axios'
import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import { BridgeModule, CacheConfig } from '@xyo-network/bridge-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import {
  AnyConfigSchema,
  creatableModule,
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleEventData,
  ModuleParams,
  ModuleQueryResult,
} from '@xyo-network/module'
import { NodeAttachQuerySchema } from '@xyo-network/node'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import compact from 'lodash/compact'
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

  connect(): Promisable<boolean> {
    return true
  }

  disconnect(): Promisable<boolean> {
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

  targetQueries(address: string): string[] {
    return assertEx(this._targetQueries[address], `targetQueries not set [${address}]`)
  }

  async targetQuery(address: string, query: QueryBoundWitness, payloads: Payload[] = []): Promise<ModuleQueryResult> {
    await this.started('throw')
    try {
      const moduleUrlString = this.moduleUrl(address).toString()
      const result = await this.axios.post<ApiEnvelope<ModuleQueryResult>>(moduleUrlString, [query, payloads])
      if (result.status === 404) {
        throw `target module not found [${moduleUrlString}] [${result.status}]`
      }
      if (result.status >= 400) {
        this.logger?.error(`targetQuery failed [${moduleUrlString}]`)
        throw `targetQuery failed [${moduleUrlString}] [${result.status}]`
      }
      return result.data.data
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
    // const start = Date.now()
    await super.startHandler()
    const rootAddress = await this.initRootAddress()
    this.downResolver.addResolver(this.targetDownResolver())
    await this.targetDiscover(rootAddress)

    const childAddresses = await this.targetDownResolver().getRemoteAddresses()

    const children = compact(
      await Promise.all(
        childAddresses.map(async (address) => {
          const resolved = await this.targetDownResolver().resolve({ address: [address] })
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
  }

  private async initRootAddress() {
    const queryPayload: ModuleDiscoverQuery = { schema: ModuleDiscoverQuerySchema }
    const boundQuery = await this.bindQuery(queryPayload)
    const response = await this.axios.post<ApiEnvelope<ModuleQueryResult>>(this.nodeUrl.toString(), boundQuery)
    this._rootAddress = AxiosJson.finalPath(response)
    return this._rootAddress
  }
}
