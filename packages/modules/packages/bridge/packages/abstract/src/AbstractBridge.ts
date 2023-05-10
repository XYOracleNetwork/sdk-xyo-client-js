import { Account } from '@xyo-network/account'
import {
  BridgeConfigSchema,
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
  BridgeModule,
  BridgeModuleQueries,
  BridgeParams,
  BridgeQuery,
} from '@xyo-network/bridge-model'
import { BridgeModuleResolver } from '@xyo-network/bridge-module-resolver'
import {
  AbstractModule,
  duplicateModules,
  Module,
  ModuleConfig,
  ModuleErrorBuilder,
  ModuleEventData,
  ModuleFilter,
  ModuleParams,
  ModuleQueryResult,
  Query,
  QueryBoundWitness,
  QueryBoundWitnessWrapper,
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
  static override configSchema: string = BridgeConfigSchema

  protected _targetDownResolvers: Record<string, BridgeModuleResolver> = {}

  protected override readonly queryAccountPaths: Record<BridgeModuleQueries['schema'], string> = {
    'network.xyo.query.bridge.connect': '1/1',
    'network.xyo.query.bridge.disconnect': '1/2',
    ...super.queryAccountPaths,
  }

  override get queries(): string[] {
    return [BridgeConnectQuerySchema, BridgeDisconnectQuerySchema, ...super.queries]
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

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<BridgeQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    const queryAccount = new Account()
    const resultPayloads: Payload[] = []
    try {
      switch (typedQuery.schema) {
        case BridgeConnectQuerySchema: {
          await this.connect()
          break
        }
        case BridgeDisconnectQuerySchema: {
          await this.disconnect()
          break
        }
        default:
          return await super.queryHandler(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new ModuleErrorBuilder().sources([wrapper.hash]).message(error.message).build())
    }
    return await this.bindQueryResult(typedQuery, resultPayloads, [queryAccount])
  }

  protected override async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]> {
    return [...(await super.resolve<TModule>(filter)), ...(await this.targetDownResolver().resolve<TModule>(filter))].filter(duplicateModules)
  }

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract targetConfig(address: string): ModuleConfig

  abstract targetDiscover(address: string): Promisable<Payload[]>

  abstract targetQueries(address: string): string[]

  abstract targetQuery(address: string, query: Query, payloads?: Payload[]): Promisable<ModuleQueryResult | undefined>

  abstract targetQueryable(address: string, query: QueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): boolean
}
