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
  AbstractModuleInstance,
  duplicateModules,
  ModuleConfig,
  ModuleErrorBuilder,
  ModuleEventData,
  ModuleFilter,
  ModuleQueryResult,
} from '@xyo-network/module'
import { ModuleFilterOptions, ModuleInstance } from '@xyo-network/module-model'
import { ModuleError, Payload, Query } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractBridge<TParams extends BridgeParams = BridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractModuleInstance<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
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

  override async resolve(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  override async resolve(nameOrAddress: string, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  override async resolve(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    const direction = options?.direction ?? 'down'
    const down = direction === 'down' || direction === 'all'
    await this.started('throw')
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return (
          (await super.resolve(nameOrAddressOrFilter, options)) ?? (down ? await this.targetDownResolver().resolve(nameOrAddressOrFilter) : undefined)
        )
      }
      default: {
        return [
          ...(down ? await this.targetDownResolver().resolve(nameOrAddressOrFilter) : []),
          ...(await super.resolve(nameOrAddressOrFilter, options)),
        ].filter(duplicateModules)
      }
    }
  }

  targetDownResolver(address?: string): BridgeModuleResolver {
    this._targetDownResolvers[address ?? 'root'] = this._targetDownResolvers[address ?? 'root'] ?? new BridgeModuleResolver(this, this.account)
    return this._targetDownResolvers[address ?? 'root'] as BridgeModuleResolver
  }

  async targetResolve(address: string, filter?: ModuleFilter): Promise<ModuleInstance[]>
  async targetResolve(address: string, nameOrAddress: string): Promise<ModuleInstance | undefined>
  async targetResolve(address: string, nameOrAddressOrFilter?: ModuleFilter | string): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    if (typeof nameOrAddressOrFilter === 'string') {
      return await this.targetDownResolver(address).resolve(nameOrAddressOrFilter)
    } else {
      return await this.targetDownResolver(address).resolve(nameOrAddressOrFilter)
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

  abstract getRootAddress(): Promisable<string>

  abstract targetConfig(address: string): ModuleConfig

  abstract targetDiscover(address: string): Promisable<Payload[]>

  abstract targetQueries(address: string): string[]

  abstract targetQuery(address: string, query: Query, payloads?: Payload[]): Promisable<ModuleQueryResult>

  abstract targetQueryable(address: string, query: QueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): boolean
}
