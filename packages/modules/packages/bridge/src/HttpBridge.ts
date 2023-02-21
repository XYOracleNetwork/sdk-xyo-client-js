import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { XyoApiEnvelope } from '@xyo-network/api-models'
import { AxiosError, AxiosJson } from '@xyo-network/axios'
import {
  AbstractModule,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleParams,
  ModuleQueryResult,
  ModuleResolver,
  ModuleWrapper,
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

export class HttpBridge<TConfig extends HttpBridgeConfig = HttpBridgeConfig> extends AbstractModule<TConfig> implements BridgeModule {
  private axios: AxiosJson
  private remoteQueries: string[] = []
  private remoteResolver: ModuleResolver

  protected constructor(params: XyoHttpBridgeParams<TConfig>) {
    super(params)
    this.axios = params.axios ?? new AxiosJson()
    this.remoteResolver = new RemoteModuleResolver(this)
  }

  public get nodeUri() {
    return assertEx(this.config?.nodeUri, 'Missing nodeUri')
  }

  public override get queries() {
    return [...super.queries, ...this.remoteQueries]
  }

  public get targetAddress() {
    return this.config?.targetAddress
  }

  static override async create(params: XyoHttpBridgeParams): Promise<HttpBridge> {
    const result = (await super.create(params)) as HttpBridge
    const moduleWrapper = ModuleWrapper.wrap(result)
    const discover = await moduleWrapper.discover()
    result.remoteQueries = compact(
      discover.map((payload) => {
        if (payload.schema === QuerySchema) {
          const schemaPayload = payload as QueryPayload
          return schemaPayload.query
        } else {
          return null
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

  override async discover() {
    const queryPayload = PayloadWrapper.parse<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    return (await this.forward(queryPayload))[1]
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
          if (super.queries.find((schema) => schema === typedQuery.schema)) {
            return await super.query(query, payloads)
          } else {
            return await this.forward(query, payloads)
          }
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new XyoErrorBuilder([wrapper.hash], error.message).build())
    }
    return await this.bindResult(resultPayloads, queryAccount)
  }

  override async resolve(filter?: ModuleFilter) {
    return [...(await super.resolve(filter)), ...(await this.remoteResolver.resolve(filter))]
  }

  protected async forward(query: XyoQuery, payloads: XyoPayload[] = []): Promise<ModuleQueryResult> {
    try {
      const boundQuery = await this.bindQuery(query, payloads)
      const result = await this.axios.post<XyoApiEnvelope<ModuleQueryResult>>(`${this.nodeUri}/address/${this.targetAddress}`, boundQuery)
      return result.data.data
    } catch (ex) {
      const error = ex as AxiosError
      this.logger?.error(`Error Status: ${error.status}`)
      this.logger?.error(`Error Cause: ${JSON.stringify(error.cause, null, 2)}`)
      throw error
    }
  }
}
