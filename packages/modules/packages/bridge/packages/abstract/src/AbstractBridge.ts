import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import {
  BridgeConfigSchema,
  BridgeConnectedQuerySchema,
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
  BridgeModule,
  BridgeParams,
  BridgeQueries,
} from '@xyo-network/bridge-model'
import { BridgeModuleResolver } from '@xyo-network/bridge-module-resolver'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import {
  duplicateModules,
  ModuleConfig,
  ModuleEventData,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryHandlerResult,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { Payload, Query } from '@xyo-network/payload-model'

export abstract class AbstractBridge<TParams extends BridgeParams = BridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractModuleInstance<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override readonly configSchemas: string[] = [BridgeConfigSchema]

  connected = false

  protected _targetDownResolvers: Record<Address, BridgeModuleResolver> = {}

  override get queries(): string[] {
    return [BridgeConnectQuerySchema, BridgeDisconnectQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<BridgeQueries['schema'], string> {
    return {
      'network.xyo.query.bridge.connect': '1/1',
      'network.xyo.query.bridge.connected': '1/3',
      'network.xyo.query.bridge.disconnect': '1/2',
    }
  }

  override async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    nameOrAddress: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | undefined>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    nameOrAddressOrFilter?: ModuleFilter<T> | ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const direction = options?.direction ?? 'down'
    const down = direction === 'down' || direction === 'all'
    await this.started('throw')
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return (
          (await super.resolve<T>(nameOrAddressOrFilter, options)) ??
          (down ? await this.targetDownResolver()?.resolve<T>(nameOrAddressOrFilter, { ...options, direction: 'down' }) : undefined)
        )
      }
      default: {
        return [
          ...(down ? (await this.targetDownResolver()?.resolve(nameOrAddressOrFilter, { ...options, direction: 'down' })) ?? [] : []),
          ...(await super.resolve<T>(nameOrAddressOrFilter, options)),
        ].filter(duplicateModules)
      }
    }
  }

  targetDiscover(_address?: Address, _maxDepth?: number): Promisable<Payload[]> {
    throw new Error('Not Supported')
  }

  targetDownResolver<T extends ModuleInstance = ModuleInstance>(
    address?: Address,
    options?: ModuleFilterOptions<T>,
  ): BridgeModuleResolver<T> | undefined {
    if (!this.connected) {
      return undefined
    }
    this._targetDownResolvers[address ?? 'root'] =
      this._targetDownResolvers[address ?? 'root'] ?? new BridgeModuleResolver(this, this.account, options)
    return this._targetDownResolvers[address ?? 'root'] as BridgeModuleResolver<T>
  }

  async targetResolve<T extends ModuleInstance = ModuleInstance>(
    address: Address,
    filter?: ModuleFilter<T>,
    options?: ModuleFilterOptions<T>,
  ): Promise<ModuleInstance[]>
  async targetResolve<T extends ModuleInstance = ModuleInstance>(
    address: Address,
    nameOrAddress: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<ModuleInstance | undefined>
  async targetResolve<T extends ModuleInstance = ModuleInstance>(
    address: Address,
    nameOrAddressOrFilter?: ModuleFilter | ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    return (
      (typeof nameOrAddressOrFilter === 'string' ?
        await this.targetDownResolver(address, options)?.resolve(nameOrAddressOrFilter)
      : await this.targetDownResolver(address, options)?.resolve(nameOrAddressOrFilter)) ?? []
    )
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness>(
    query: T,
    payloads?: Payload[],
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<BridgeQueries>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    const resultPayloads: Payload[] = []

    switch (queryPayload.schema) {
      case BridgeConnectQuerySchema: {
        await this.connect()
        break
      }
      case BridgeConnectedQuerySchema: {
        resultPayloads.push({ connected: await this.connect(), schema: 'network.xyo.bridge.connected' } as Payload)
        break
      }
      case BridgeDisconnectQuerySchema: {
        await this.disconnect()
        break
      }
      default: {
        return await super.queryHandler(query, payloads)
      }
    }
    return resultPayloads
  }

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract getRootAddress(): Promisable<Address>

  abstract targetConfig(address: Address): ModuleConfig

  abstract targetManifest(address: Address, maxDepth?: number): Promisable<ModuleManifestPayload>

  abstract targetQueries(address: Address): string[]

  abstract targetQuery(address: Address, query: Query, payloads?: Payload[]): Promisable<ModuleQueryResult>

  abstract targetQueryable(address: Address, query: QueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): boolean
}
