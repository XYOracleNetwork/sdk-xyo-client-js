import { assertEx } from '@xylabs/assert'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { XyoApiEnvelope } from '@xyo-network/api-models'
import { AxiosError, AxiosJson } from '@xyo-network/axios'
import { BridgeModule } from '@xyo-network/bridge-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import {
  AnyConfigSchema,
  creatableModule,
  Module,
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleEventData,
  ModuleParams,
  ModuleQueryResult,
  ModuleWrapper,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import compact from 'lodash/compact'

import { HttpBridgeConfig } from './HttpBridgeConfig'

export type XyoHttpBridgeParams<TConfig extends AnyConfigSchema<HttpBridgeConfig> = AnyConfigSchema<HttpBridgeConfig>> = ModuleParams<
  TConfig,
  {
    axios?: AxiosJson
  }
>

@creatableModule()
export class HttpBridge<
    TParams extends XyoHttpBridgeParams = XyoHttpBridgeParams,
    TEventData extends ModuleEventData = ModuleEventData,
    TModule extends Module<ModuleParams, TEventData> = Module<ModuleParams, TEventData>,
  >
  extends AbstractBridge<TParams, TEventData, TModule>
  implements BridgeModule<TParams, TEventData, TModule>
{
  private _axios?: AxiosJson
  private _rootAddress?: string
  private _targetConfigs: Record<string, ModuleConfig> = {}
  private _targetQueries: Record<string, string[]> = {}

  get axios() {
    this._axios = this._axios ?? this.params.axios ?? new AxiosJson()
    return this._axios
  }

  get nodeUri() {
    return assertEx(this.config?.nodeUri, 'Missing nodeUri')
  }

  get rootAddress() {
    return assertEx(this._rootAddress, 'missing rootAddress')
  }

  connect(): Promisable<boolean> {
    return true
  }

  disconnect(): Promisable<boolean> {
    return true
  }

  override async start() {
    await super.start()
    this.downResolver.addResolver(this.targetDownResolver())
    const rootAddress = assertEx(await this.initRootAddress(), `Failed to get rootAddress [${this.nodeUri}]`)
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

    await Promise.all(children.map(async (child) => await ModuleWrapper.wrap(child).discover()))
  }

  targetConfig(address: string): ModuleConfig {
    return assertEx(this._targetConfigs[address], `targetConfig not set [${address}]`)
  }

  async targetDiscover(address: string): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.parse<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    const boundQuery = await this.bindQuery(queryPayload)
    const discover = assertEx(await this.targetQuery(address, boundQuery[0], boundQuery[1]), `Unable to resolve [${address}]`)[1]

    this._targetQueries[address] = compact(
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

    this._targetConfigs[address] = assertEx(
      discover?.find((payload) => payload.schema === targetConfigSchema) as ModuleConfig,
      `Discover did not return a [${targetConfigSchema}] payload`,
    )

    return discover
  }

  targetQueries(address: string): string[] {
    return assertEx(this._targetQueries[address], `targetQueries not set [${address}]`)
  }

  async targetQuery(address: string, query: XyoQueryBoundWitness, payloads: Payload[] = []): Promise<ModuleQueryResult | undefined> {
    try {
      const path = `${this.nodeUri}/${address ? address : ''}`
      const result = await this.axios.post<XyoApiEnvelope<ModuleQueryResult>>(path, [query, payloads])
      if (result.status === 404) {
        return undefined
      }
      if (result.status >= 400) {
        this.logger?.error(`targetQuery failed [${path}]`)
        throw `targetQuery failed [${path}] [${result.status}]`
      }
      return result.data.data
    } catch (ex) {
      const error = ex as AxiosError
      this.logger?.error(`Error Status: ${error.status}`)
      this.logger?.error(`Error Cause: ${JSON.stringify(error.cause, null, 2)}`)
      throw error
    }
  }

  targetQueryable(_address: string, _query: XyoQueryBoundWitness, _payloads?: Payload[], _queryConfig?: ModuleConfig): boolean {
    return true
  }

  private async initRootAddress() {
    const queryPayload = PayloadWrapper.parse<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    const boundQuery = await this.bindQuery(queryPayload)
    const response = await this.axios.post<XyoApiEnvelope<ModuleQueryResult>>(this.nodeUri, boundQuery)
    this._rootAddress = AxiosJson.finalPath(response)
    return this._rootAddress
  }
}
