import { Account } from '@xyo-network/account'
import {
  BridgeConfigSchema,
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
  BridgeModule,
  BridgeParams,
  BridgeQuery,
  BridgeQueryBase,
} from '@xyo-network/bridge-model'
import { BridgeModuleResolver } from '@xyo-network/bridge-module-resolver'
import { handleErrorAsync } from '@xyo-network/error'
import {
  AbstractModule,
  duplicateModules,
  Module,
  ModuleConfig,
  ModuleError,
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
  static override readonly configSchemas: string[] = [BridgeConfigSchema]

  protected _targetDownResolvers: Record<string, BridgeModuleResolver> = {}

  override get queries(): string[] {
    return [BridgeConnectQuerySchema, BridgeDisconnectQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<BridgeQueryBase['schema'], string> {
    return {
      'network.xyo.query.bridge.connect': '1/1',
      'network.xyo.query.bridge.disconnect': '1/2',
    }
  }

  override async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]>
  override async resolve<TModule extends Module = Module>(nameOrAddress: string): Promise<TModule | undefined>
  override async resolve<TModule extends Module = Module>(nameOrAddressOrFilter?: ModuleFilter | string): Promise<TModule | TModule[] | undefined> {
    return await this.busy(async () => {
      switch (typeof nameOrAddressOrFilter) {
        case 'string': {
          const byAddress = Account.isAddress(nameOrAddressOrFilter)
            ? (await super.resolve<TModule>({ address: [nameOrAddressOrFilter] })).pop() ??
              (await this.targetDownResolver().resolve<TModule>({ address: [nameOrAddressOrFilter] })).pop()
            : undefined
          return (
            byAddress ??
            (await super.resolve<TModule>({ name: [nameOrAddressOrFilter] })).pop() ??
            (await this.targetDownResolver().resolve<TModule>({ name: [nameOrAddressOrFilter] })).pop()
          )
        }
        default: {
          const filter: ModuleFilter | undefined = nameOrAddressOrFilter
          return [...(await this.targetDownResolver().resolve<TModule>(filter)), ...(await super.resolve<TModule>(filter))].filter(duplicateModules)
        }
      }
    })
  }

  targetDownResolver(address?: string): BridgeModuleResolver {
    this._targetDownResolvers[address ?? 'root'] = this._targetDownResolvers[address ?? 'root'] ?? new BridgeModuleResolver(this, this.account)
    return this._targetDownResolvers[address ?? 'root'] as BridgeModuleResolver
  }

  async targetResolve(address: string, filter?: ModuleFilter) {
    //TODO: Honor address so that the resolve only is done through that remote module
    //right now, we check the entire remote hive
    return (await this.targetDownResolver(address).resolve(filter)) as TModule[]
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<BridgeQuery>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    const queryAccount = Account.randomSync()
    const resultPayloads: Payload[] = []
    const errorPayloads: ModuleError[] = []
    try {
      switch (queryPayload.schema) {
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
    } catch (error) {
      await handleErrorAsync(error, async (error) => {
        errorPayloads.push(
          new ModuleErrorBuilder()
            .sources([await wrapper.hashAsync()])
            .name(this.config.name ?? '<Unknown>')
            .query(query.schema)
            .message(error.message)
            .build(),
        )
      })
    }
    return (await this.bindQueryResult(queryPayload, resultPayloads, [queryAccount], errorPayloads))[0]
  }

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract targetConfig(address: string): ModuleConfig

  abstract targetDiscover(address: string): Promisable<Payload[]>

  abstract targetQueries(address: string): string[]

  abstract targetQuery(address: string, query: Query, payloads?: Payload[]): Promisable<ModuleQueryResult>

  abstract targetQueryable(address: string, query: QueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): boolean
}
