import { Account } from '@xyo-network/account'
import { BridgeModule, BridgeParams, XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from '@xyo-network/bridge-model'
import { BridgeModuleResolver } from '@xyo-network/bridge-module-resolver'
import {
  AbstractModule,
  duplicateModules,
  Module,
  ModuleConfig,
  ModuleEventData,
  ModuleFilter,
  ModuleParams,
  ModuleQueryResult,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoQuery,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractBridge<
    TParams extends BridgeParams = BridgeParams,
    TEventData extends ModuleEventData = ModuleEventData,
    TModule extends Module<ModuleParams, TEventData> = Module<ModuleParams, TEventData>,
  >
  extends AbstractModule<TParams, TEventData>
  implements BridgeModule<TParams, TEventData, TModule>
{
  protected _targetDownResolvers: Record<string, BridgeModuleResolver> = {}

  override get queries(): string[] {
    return [XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, ...super.queries]
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoBridgeQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    const queryAccount = new Account()
    const resultPayloads: Payload[] = []
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

  targetDownResolver(address?: string): BridgeModuleResolver {
    this._targetDownResolvers[address ?? 'root'] = this._targetDownResolvers[address ?? 'root'] ?? new BridgeModuleResolver(this)
    return this._targetDownResolvers[address ?? 'root'] as BridgeModuleResolver
  }

  async targetResolve(address: string, filter?: ModuleFilter) {
    //TODO: Honor address so that the resolve only is done through that remote module
    //right now, we check the entire remote hive
    return (await this.targetDownResolver(address).resolve(filter)) as TModule[]
  }

  protected override async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]> {
    return [...(await super.resolve<TModule>(filter)), ...(await this.targetDownResolver().resolve<TModule>(filter))].filter(duplicateModules)
  }

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract targetConfig(address: string): ModuleConfig

  abstract targetDiscover(address: string): Promisable<Payload[]>

  abstract targetQueries(address: string): string[]

  abstract targetQuery(address: string, query: XyoQuery, payloads?: Payload[]): Promisable<ModuleQueryResult | undefined>

  abstract targetQueryable(address: string, query: XyoQueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): boolean
}
