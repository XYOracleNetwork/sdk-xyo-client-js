import { Account } from '@xyo-network/account'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
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
  ModuleErrorBuilder,
  ModuleEventData,
  ModuleFilter,
  ModuleParams,
  ModuleQueryResult,
} from '@xyo-network/module'
import { IndirectModule, ModuleFilterOptions } from '@xyo-network/module-model'
import { ModuleError, Payload, Query } from '@xyo-network/payload-model'
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

  override async resolve<TModule extends Module = Module>(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<TModule[]>
  override async resolve<TModule extends Module = Module>(nameOrAddress: string, options?: ModuleFilterOptions): Promise<TModule | undefined>
  override async resolve<TModule extends Module = Module>(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<TModule | TModule[] | undefined> {
    const direction = options?.direction ?? 'all'
    const down = direction === 'down' || direction === 'all'
    await this.started('throw')
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return (
          (await super.resolve<TModule>(nameOrAddressOrFilter, options)) ??
          (down ? await this.targetDownResolver().resolve<TModule>(nameOrAddressOrFilter) : undefined)
        )
      }
      default: {
        return [
          ...(down ? await this.targetDownResolver().resolve<TModule>(nameOrAddressOrFilter) : []),
          ...(await super.resolve<TModule>(nameOrAddressOrFilter, options)),
        ].filter(duplicateModules)
      }
    }
  }

  targetDownResolver(address?: string): BridgeModuleResolver {
    this._targetDownResolvers[address ?? 'root'] = this._targetDownResolvers[address ?? 'root'] ?? new BridgeModuleResolver(this, this.account)
    return this._targetDownResolvers[address ?? 'root'] as BridgeModuleResolver
  }

  async targetResolve<TModule extends IndirectModule = IndirectModule>(address: string, filter?: ModuleFilter): Promise<TModule[]>
  async targetResolve<TModule extends IndirectModule = IndirectModule>(address: string, nameOrAddress: string): Promise<TModule | undefined>
  async targetResolve<TModule extends IndirectModule = IndirectModule>(
    address: string,
    nameOrAddressOrFilter?: ModuleFilter | string,
  ): Promise<TModule | TModule[] | undefined> {
    if (typeof nameOrAddressOrFilter === 'string') {
      return await this.targetDownResolver(address).resolve<TModule>(nameOrAddressOrFilter)
    } else {
      return await this.targetDownResolver(address).resolve<TModule>(nameOrAddressOrFilter)
    }
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
