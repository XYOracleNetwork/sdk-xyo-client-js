import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import {
  BridgeConfigSchema,
  BridgeConnectedQuerySchema,
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
  BridgeExposeOptions,
  BridgeExposeQuerySchema,
  BridgeInstance,
  BridgeModuleEventData,
  BridgeParams,
  BridgeQueries,
  BridgeUnexposeOptions,
  BridgeUnexposeQuerySchema,
  ModuleFilterPayload,
  ModuleFilterPayloadSchema,
} from '@xyo-network/bridge-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { ModuleFilter, ModuleFilterOptions, ModuleIdentifier, ModuleInstance, ModuleQueryHandlerResult } from '@xyo-network/module-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export abstract class AbstractBridge<TParams extends BridgeParams = BridgeParams>
  extends AbstractModuleInstance<TParams, BridgeModuleEventData>
  implements BridgeInstance<TParams, BridgeModuleEventData>
{
  static override readonly configSchemas: string[] = [BridgeConfigSchema]

  override get queries(): string[] {
    return [BridgeConnectQuerySchema, BridgeDisconnectQuerySchema, BridgeExposeQuerySchema, BridgeUnexposeQuerySchema, ...super.queries]
  }

  get resolver() {
    return assertEx(this.params.resolver, () => 'No resolver provided')
  }

  protected override get _queryAccountPaths(): Record<BridgeQueries['schema'], string> {
    return {
      'network.xyo.query.bridge.connect': '1/1',
      'network.xyo.query.bridge.connected': '1/3',
      'network.xyo.query.bridge.disconnect': '1/2',
      'network.xyo.query.bridge.expose': '1/4',
      'network.xyo.query.bridge.unexpose': '1/5',
    }
  }

  connect(): Promisable<boolean> {
    this._noOverride('connect')
    throw new Error('Unsupported')
  }

  disconnect(): Promisable<boolean> {
    this._noOverride('disconnect')
    throw new Error('Unsupported')
  }

  async expose(id: string, options?: BridgeExposeOptions | undefined): Promise<Address[]> {
    this._noOverride('expose')
    const address = await this.exposeHandler(id, options)
    await this.emit('exposed', { address, module: this })
    return address
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(): Promise<ModuleInstance[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  /** @deprecated use '*' if trying to resolve all */
  override async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    return await this.resolver.resolve(idOrFilter, options)
  }

  async unexpose(id: string, options?: BridgeUnexposeOptions | undefined): Promise<Address[]> {
    this._noOverride('unexpose')
    const address = this.unexposeHandler(id, options)
    await this.emit('unexposed', { address, module: this })
    return address
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
      case BridgeExposeQuerySchema: {
        const filterPayloads = (payloads ?? []).filter(isPayloadOfSchemaType<ModuleFilterPayload>(ModuleFilterPayloadSchema))
        assertEx(filterPayloads, () => 'At least one filter is required')

        await Promise.all(
          filterPayloads.map(async (filter) => {
            const { id, ...options } = filter
            const addresses = await this.expose(id, options)
            addresses.map((address) => {
              const addressPayload: AddressPayload = {
                address,
                schema: AddressSchema,
              }
              resultPayloads.push(addressPayload)
            })
          }),
        )
        break
      }
      case BridgeUnexposeQuerySchema: {
        const filterPayloads = (payloads ?? []).filter(isPayloadOfSchemaType<ModuleFilterPayload>(ModuleFilterPayloadSchema))
        assertEx(filterPayloads, () => 'At least one filter is required')

        await Promise.all(
          filterPayloads.map(async (filter) => {
            const { id, ...options } = filter
            const addresses = await this.unexpose(id, options)
            addresses.map((address) => {
              const addressPayload: AddressPayload = {
                address,
                schema: AddressSchema,
              }
              resultPayloads.push(addressPayload)
            })
          }),
        )
        break
      }
      default: {
        return await super.queryHandler(query, payloads)
      }
    }
    return resultPayloads
  }

  abstract exposeHandler(id: ModuleIdentifier, options?: BridgeExposeOptions | undefined): Promisable<Address[]>

  abstract unexposeHandler(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promisable<Address[]>
}
