import { assertEx } from '@xylabs/assert'
import { forget } from '@xylabs/forget'
import { Address } from '@xylabs/hex'
import { globallyUnique } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import {
  AttachableBridgeInstance,
  BridgeConfigSchema,
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
  BridgeExposeOptions,
  BridgeExposeQuerySchema,
  BridgeModuleEventData,
  BridgeParams,
  BridgeQueries,
  BridgeUnexposeOptions,
  BridgeUnexposeQuerySchema,
  ModuleFilterPayload,
  ModuleFilterPayloadSchema,
} from '@xyo-network/bridge-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import {
  duplicateModules,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryHandlerResult,
  ModuleResolverInstance,
  resolvePathToAddress,
} from '@xyo-network/module-model'
import { isPayloadOfSchemaType, Payload, Schema } from '@xyo-network/payload-model'

export abstract class AbstractBridge<TParams extends BridgeParams = BridgeParams>
  extends AbstractModuleInstance<TParams, BridgeModuleEventData>
  implements AttachableBridgeInstance<TParams, BridgeModuleEventData>
{
  static override readonly configSchemas: Schema[] = [...super.configSchemas, BridgeConfigSchema]
  static override readonly defaultConfigSchema: Schema = BridgeConfigSchema
  static override readonly uniqueName = globallyUnique('AbstractBridge', AbstractBridge, 'xyo')

  override get allowNameResolution() {
    //we default to false here to prevent name collisions
    return this.params.allowNameResolution ?? false
  }

  override get queries(): string[] {
    return [BridgeConnectQuerySchema, BridgeDisconnectQuerySchema, BridgeExposeQuerySchema, BridgeUnexposeQuerySchema, ...super.queries]
  }

  get resolver(): ModuleResolverInstance {
    return assertEx(this.params.resolver, () => 'No resolver provided')
  }

  protected override get _queryAccountPaths(): Record<BridgeQueries['schema'], string> {
    return {
      'network.xyo.query.bridge.connect': '1/1',
      'network.xyo.query.bridge.disconnect': '1/2',
      'network.xyo.query.bridge.expose': '1/4',
      'network.xyo.query.bridge.unexpose': '1/5',
    }
  }

  async expose(id: ModuleIdentifier, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    this._noOverride('expose')
    assertEx(id !== '*', () => "Exposing '*' not supported")
    const addressToExpose = assertEx(await resolvePathToAddress(this, id), () => `Module to expose not found [${id}]`)
    console.log(`expose: ${addressToExpose}`)
    const modules = await this.exposeHandler(addressToExpose, options)
    await this.emit('exposed', { module: this, modules })
    return modules
  }

  async exposed(): Promise<Address[]> {
    this._noOverride('exposed')
    return await this.exposedHandler()
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(): Promise<ModuleInstance[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  /** @deprecated use '*' if trying to resolve all */
  override async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    if (idOrFilter === '*') {
      await this.getRoots()
      return (await Promise.all((await this.getRoots()).map((root) => root.resolve('*', options)))).flat().filter(duplicateModules)
    }
    switch (typeof idOrFilter) {
      case 'string': {
        return await super.resolve(idOrFilter, options)
      }
      case 'object': {
        return (await super.resolve(idOrFilter, options)).filter((mod) => mod.address !== this.address)
      }
      default: {
        return (await super.resolve(idOrFilter, options)).filter((mod) => mod.address !== this.address)
      }
    }
  }

  override async startHandler(): Promise<boolean> {
    const { discoverRoots } = this.config
    if (discoverRoots === 'start') {
      await this.getRoots()
    } else {
      forget(this.getRoots())
    }
    return true
  }

  async unexpose(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promise<ModuleInstance[]> {
    this._noOverride('unexpose')
    const addressToUnexpose = assertEx(await resolvePathToAddress(this, id), () => `Module to unexpose not found [${id}]`)
    const modules = await this.unexposeHandler(addressToUnexpose, options)
    await this.emit('unexposed', { module: this, modules })
    return modules
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness>(
    query: T,
    payloads?: Payload[],
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<BridgeQueries>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    const resultPayloads: Payload[] = []

    switch (queryPayload.schema) {
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

  abstract exposeHandler(address: Address, options?: BridgeExposeOptions | undefined): Promisable<ModuleInstance[]>

  abstract exposedHandler(): Promisable<Address[]>

  abstract getRoots(force?: boolean): Promise<ModuleInstance[]>

  abstract unexposeHandler(address: Address, options?: BridgeUnexposeOptions | undefined): Promisable<ModuleInstance[]>
}
