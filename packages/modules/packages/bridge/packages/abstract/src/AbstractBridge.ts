import { Account } from '@xyo-network/account'
import { BridgeModule, BridgeParams, XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from '@xyo-network/bridge-model'
import {
  AbstractModule,
  duplicateModules,
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

export abstract class AbstractBridge<TParams extends BridgeParams = BridgeParams, TModule extends Module = Module>
  extends AbstractModule<TParams>
  implements BridgeModule<TParams, TModule>
{
  abstract targetDownResolver: ModuleResolver

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

  protected override async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]> {
    return [...(await super.resolve<TModule>(filter)), ...(await this.targetDownResolver.resolve<TModule>(filter))].filter(duplicateModules)
  }

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract targetConfig(address: string): ModuleConfig

  abstract targetDiscover(address: string): Promisable<XyoPayload[]>

  abstract targetQueries(address: string): string[]

  abstract targetQuery(address: string, query: XyoQuery, payloads?: XyoPayload[]): Promisable<ModuleQueryResult | undefined>

  abstract targetQueryable(address: string, query: XyoQueryBoundWitness, payloads?: XyoPayload[], queryConfig?: ModuleConfig): boolean

  abstract targetResolve(address: string, filter?: ModuleFilter): Promisable<TModule[]>
}
