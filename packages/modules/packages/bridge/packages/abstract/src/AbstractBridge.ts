import { assertEx } from '@xylabs/assert'
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
import { ModuleIdentifier, ModuleInstance, ModuleQueryHandlerResult, ModuleResolverInstance } from '@xyo-network/module-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export abstract class AbstractBridge<TParams extends BridgeParams = BridgeParams>
  extends AbstractModuleInstance<TParams, BridgeModuleEventData>
  implements BridgeInstance<TParams, BridgeModuleEventData>
{
  static override readonly configSchemas: string[] = [BridgeConfigSchema]

  override get queries(): string[] {
    return [BridgeConnectQuerySchema, BridgeDisconnectQuerySchema, BridgeExposeQuerySchema, BridgeUnexposeQuerySchema, ...super.queries]
  }

  get resolver(): ModuleResolverInstance {
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

  async expose(id: ModuleIdentifier, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    this._noOverride('expose')
    assertEx(id !== '*', () => "Exposing '*' not supported")
    const modules = await this.exposeHandler(id, options)
    await this.emit('exposed', { module: this, modules })
    return modules
  }

  override async startHandler() {
    await this.discoverRoots()
    return await super.startHandler()
  }

  async unexpose(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promise<ModuleInstance[]> {
    this._noOverride('unexpose')
    const modules = this.unexposeHandler(id, options)
    await this.emit('unexposed', { module: this, modules })
    return modules
  }

  protected discoverRoots(): Promisable<ModuleInstance[]> {
    return []
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
            const modules = await this.expose(id, options)
            modules.map((module) => {
              const addressPayload: AddressPayload = {
                address: module.address,
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
            const modules = await this.unexpose(id, options)
            modules.map((module) => {
              const addressPayload: AddressPayload = {
                address: module.address,
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

  abstract exposeHandler(id: ModuleIdentifier, options?: BridgeExposeOptions | undefined): Promisable<ModuleInstance[]>

  abstract unexposeHandler(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promisable<ModuleInstance[]>
}
