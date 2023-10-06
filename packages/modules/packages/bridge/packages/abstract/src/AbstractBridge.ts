import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import {
  BridgeConfigSchema,
  BridgeConnectedQuerySchema,
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
  BridgeModule,
  BridgeParams,
  BridgeQuery,
  BridgeQueryBase,
} from '@xyo-network/bridge-model'
import { BridgeModuleResolver } from '@xyo-network/bridge-module-resolver'
import { ManifestPayload } from '@xyo-network/manifest-model'
import { AbstractModuleInstance, duplicateModules, ModuleConfig, ModuleEventData, ModuleFilter, ModuleQueryResult } from '@xyo-network/module'
import { ModuleFilterOptions, ModuleInstance, ModuleQueryHandlerResult } from '@xyo-network/module-model'
import { Payload, Query } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractBridge<TParams extends BridgeParams = BridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractModuleInstance<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override readonly configSchemas: string[] = [BridgeConfigSchema]

  connected = false

  protected _targetDownResolvers: Record<string, BridgeModuleResolver> = {}

  override get queries(): string[] {
    return [BridgeConnectQuerySchema, BridgeDisconnectQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<BridgeQueryBase['schema'], string> {
    return {
      'network.xyo.query.bridge.connect': '1/1',
      'network.xyo.query.bridge.connected': '1/3',
      'network.xyo.query.bridge.disconnect': '1/2',
    }
  }

  override async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(nameOrAddress: string, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    nameOrAddressOrFilter?: ModuleFilter<T> | string,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const direction = options?.direction ?? 'down'
    const down = direction === 'down' || direction === 'all'
    await this.started('throw')
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return (
          (await super.resolve<T>(nameOrAddressOrFilter, options)) ??
          (down ? await this.targetDownResolver()?.resolve<T>(nameOrAddressOrFilter) : undefined)
        )
      }
      default: {
        return [
          ...(down ? (await this.targetDownResolver()?.resolve(nameOrAddressOrFilter)) ?? [] : []),
          ...(await super.resolve<T>(nameOrAddressOrFilter, options)),
        ].filter(duplicateModules)
      }
    }
  }

  targetDownResolver<T extends ModuleInstance = ModuleInstance>(
    address?: string,
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
    address: string,
    filter?: ModuleFilter<T>,
    options?: ModuleFilterOptions<T>,
  ): Promise<ModuleInstance[]>
  async targetResolve<T extends ModuleInstance = ModuleInstance>(
    address: string,
    nameOrAddress: string,
    options?: ModuleFilterOptions<T>,
  ): Promise<ModuleInstance | undefined>
  async targetResolve<T extends ModuleInstance = ModuleInstance>(
    address: string,
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions<T>,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    if (typeof nameOrAddressOrFilter === 'string') {
      return await this.targetDownResolver(address, options)?.resolve(nameOrAddressOrFilter)
    } else {
      return (await this.targetDownResolver(address, options)?.resolve(nameOrAddressOrFilter)) ?? []
    }
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness>(
    query: T,
    payloads?: Payload[],
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<BridgeQuery>(query, payloads)
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
      default:
        return await super.queryHandler(query, payloads)
    }
    return resultPayloads
  }

  abstract connect(): Promisable<boolean>
  abstract disconnect(): Promisable<boolean>

  abstract getRootAddress(): Promisable<string>

  abstract targetConfig(address: string): ModuleConfig

  abstract targetDiscover(address: string): Promisable<Payload[]>

  abstract targetManifest(address: string, maxDepth?: number): Promisable<ManifestPayload>

  abstract targetQueries(address: string): string[]

  abstract targetQuery(address: string, query: Query, payloads?: Payload[]): Promisable<ModuleQueryResult>

  abstract targetQueryable(address: string, query: QueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): boolean
}
