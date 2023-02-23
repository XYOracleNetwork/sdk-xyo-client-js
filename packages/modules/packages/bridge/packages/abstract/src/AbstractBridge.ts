import { Account } from '@xyo-network/account'
import { BridgeConfig, BridgeModule, XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from '@xyo-network/bridge-model'
import {
  AbstractModule,
  Module,
  ModuleConfig,
  ModuleFilter,
  ModuleQueryResult,
  ModuleResolver,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoQuery,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractBridge<TConfig extends BridgeConfig = BridgeConfig> extends AbstractModule<TConfig> implements BridgeModule {
  abstract targetResolver: ModuleResolver

  override get queries(): string[] {
    return [XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, ...super.queries]
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

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract targetConfig(address: string): XyoPayload

  abstract targetDiscover(address: string): Promisable<XyoPayload[]>

  abstract targetQueries(address: string): string[]

  abstract targetQuery(address: string, query: XyoQuery, payloads?: XyoPayload[]): Promisable<ModuleQueryResult>

  abstract targetQueryable(address: string, query: XyoQueryBoundWitness, payloads?: XyoPayload[], queryConfig?: ModuleConfig): boolean

  abstract targetResolve(address: string, filter?: ModuleFilter): Promisable<Module[]>
}
