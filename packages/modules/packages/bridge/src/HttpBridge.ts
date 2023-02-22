import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { XyoApiEnvelope } from '@xyo-network/api-models'
import { AxiosError, AxiosJson } from '@xyo-network/axios'
import {
  AbstractModule,
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleParams,
  ModuleQueryResult,
  ModuleResolver,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoQuery,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import compact from 'lodash/compact'

import { BridgeModule } from './Bridge'
import { HttpBridgeConfig } from './HttpBridgeConfig'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'
import { RemoteModuleResolver } from './RemoteModuleResolver'

export interface XyoHttpBridgeParams<TConfig extends HttpBridgeConfig = HttpBridgeConfig> extends ModuleParams<TConfig> {
  axios?: AxiosJson
}

export class HttpBridge<TConfig extends HttpBridgeConfig = HttpBridgeConfig> extends AbstractModule<TConfig> implements BridgeModule<TConfig> {
  private _targetQueries: Record<string, string[]> = {}
  private _targetResolver: ModuleResolver
  private axios: AxiosJson

  protected constructor(params: XyoHttpBridgeParams<TConfig>) {
    super(params)
    this.axios = params.axios ?? new AxiosJson()
    this._targetResolver = new RemoteModuleResolver(this)
  }

  public get nodeUri() {
    return assertEx(this.config?.nodeUri, 'Missing nodeUri')
  }

  public get targetAddress() {
    return assertEx(this.config?.targetAddress, 'targetAddress not set')
  }

  public get targetResolver() {
    return this._targetResolver
  }

  static override async create(params: XyoHttpBridgeParams): Promise<HttpBridge> {
    const result = (await super.create(params)) as HttpBridge
    const discover = await result.targetDiscover(params.config.targetAddress ?? '')
    await Promise.all(
      discover.map((payload) => {
        const addressPayload = payload as AddressPayload
        if (addressPayload.schema === AddressSchema) {
          return result.targetDiscover(addressPayload.address)
        }
      }),
    )
    return result
  }

  connect(): Promisable<boolean> {
    return true
  }

  disconnect(): Promisable<boolean> {
    return true
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoBridgeQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    const queryAccount = new Account()
    const resultPayloads: XyoPayload[] = []
    try {
      switch (typedQuery.schema) {
        case XyoBridgeConnectQuerySchema: {
          await this.connect()
          break
        }
        case XyoBridgeDisconnectQuerySchema: {
          await this.disconnect()
          break
        }
        default:
          return await super.query(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new XyoErrorBuilder([wrapper.hash], error.message).build())
    }
    return await this.bindResult(resultPayloads, queryAccount)
  }

  override async resolve(filter?: ModuleFilter) {
    return [...(await super.resolve(filter)), ...(await this.targetResolver.resolve(filter))]
  }

  async targetDiscover(address: string): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    const discover = assertEx(await this.targetQuery(address, queryPayload), `Unable to resolve [${address}]`)[1]

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

    return discover
  }

  public targetQueries(address: string): string[] {
    return assertEx(this._targetQueries[address], `targetConfig not set [${address}]`)
  }

  async targetQuery(address: string, query: XyoQuery, payloads: XyoPayload[] = []): Promise<ModuleQueryResult> {
    try {
      const boundQuery = await this.bindQuery(query, payloads)
      const path = `${this.nodeUri}/${address}`
      const result = await this.axios.post<XyoApiEnvelope<ModuleQueryResult>>(path, boundQuery)
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

  targetQueryable(_address: string, _query: XyoQueryBoundWitness, _payloads?: XyoPayload[], _queryConfig?: ModuleConfig): boolean {
    throw 'targetQueryable not available'
  }

  async targetResolve(address: string, filter?: ModuleFilter) {
    return await this.targetResolver.resolve(filter)
  }
}
