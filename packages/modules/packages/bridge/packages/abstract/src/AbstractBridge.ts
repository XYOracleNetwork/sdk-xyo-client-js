import { assertEx } from '@xylabs/assert'
import { isHex } from '@xylabs/hex'
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
  BridgeParams,
  BridgeQueries,
  BridgeUnexposeOptions,
  BridgeUnexposeQuerySchema,
  ModuleFilterPayload,
  ModuleFilterPayloadSchema,
} from '@xyo-network/bridge-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import {
  ModuleEventData,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryHandlerResult,
} from '@xyo-network/module-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

// const moduleIdentifierParts = (moduleIdentifier: ModuleIdentifier): ModuleIdentifierPart[] => {
//   return moduleIdentifier?.split(':') as ModuleIdentifierPart[]
// }

export abstract class AbstractBridge<TParams extends BridgeParams = BridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractModuleInstance<TParams, TEventData>
  implements BridgeInstance<TParams, TEventData>
{
  static override readonly configSchemas: string[] = [BridgeConfigSchema]

  override get queries(): string[] {
    return [BridgeConnectQuerySchema, BridgeDisconnectQuerySchema, BridgeExposeQuerySchema, BridgeUnexposeQuerySchema, ...super.queries]
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
    throw new Error('Unsupported')
  }

  disconnect(): Promisable<boolean> {
    throw new Error('Unsupported')
  }

  expose(id: string, options?: BridgeExposeOptions | undefined): Promisable<Lowercase<string>[]> {
    return this.exposeHandler(id, options)
  }

  override async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter?: ModuleFilter<T> | ModuleIdentifier,
    _options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    if (idOrFilter === undefined) {
      return []
    }
    if (typeof idOrFilter === 'string') {
      const upResolve = await this.upResolver.resolve<T>(idOrFilter)
      if (upResolve) return upResolve
      //assertEx(isHex(idOrFilter, { prefix: false }), `Name resolutions not supported [${idOrFilter}]`)
      const module = await this.resolveHandler<T>(idOrFilter)
      await module?.start?.()
      return module
    } else {
      throw new TypeError('Filter not Supported')
    }
  }

  unexpose(id: string, options?: BridgeUnexposeOptions | undefined): Promisable<Lowercase<string>[]> {
    return this.unexposeHandler(id, options)
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
        assertEx(filterPayloads, 'At least one filter is required')

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
        assertEx(filterPayloads, 'At least one filter is required')

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

  abstract exposeHandler(id: ModuleIdentifier, options?: BridgeExposeOptions | undefined): Promisable<Lowercase<string>[]>

  abstract resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promisable<T | undefined>

  abstract unexposeHandler(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promisable<Lowercase<string>[]>
}
