import { assertEx } from '@xylabs/assert'
import { globallyUnique } from '@xylabs/base'
import { exists } from '@xylabs/exists'
import { forget } from '@xylabs/forget'
import type { Address } from '@xylabs/hex'
import type { Promisable } from '@xylabs/promise'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import type {
  AttachableBridgeInstance,
  BridgeExposeOptions,
  BridgeModuleEventData,
  BridgeParams,
  BridgeQueries,
  BridgeUnexposeOptions,
  ModuleFilterPayload,
} from '@xyo-network/bridge-model'
import {
  BridgeConfigSchema,
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
  BridgeExposeQuerySchema,
  BridgeUnexposeQuerySchema,
  ModuleFilterPayloadSchema,
} from '@xyo-network/bridge-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import type {
  AddressPayload,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryHandlerResult,
  ModuleResolverInstance,
} from '@xyo-network/module-model'
import {
  AddressSchema,
  resolveAddressToInstance,
  resolvePathToAddress,
  transformModuleIdentifier,
} from '@xyo-network/module-model'
import type { Payload, Schema } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

export abstract class AbstractBridge<TParams extends BridgeParams = BridgeParams>
  extends AbstractModuleInstance<TParams, BridgeModuleEventData>
  implements AttachableBridgeInstance<TParams, BridgeModuleEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, BridgeConfigSchema]
  static override readonly defaultConfigSchema: Schema = BridgeConfigSchema
  static override readonly uniqueName = globallyUnique('AbstractBridge', AbstractBridge, 'xyo')

  protected _roots?: ModuleInstance[]

  override get allowNameResolution() {
    // we default to false here to prevent name collisions
    return this.params.allowNameResolution ?? true
  }

  get discoverRoots() {
    return this.config.client?.discoverRoots ?? this.config.discoverRoots ?? (this.config.client === undefined ? false : 'start')
  }

  override get queries(): string[] {
    return [BridgeConnectQuerySchema, BridgeDisconnectQuerySchema, BridgeExposeQuerySchema, BridgeUnexposeQuerySchema, ...super.queries]
  }

  get resolver(): Promisable<ModuleResolverInstance> {
    return assertEx(this.params.resolver, () => 'No resolver provided')
  }

  async expose(id: ModuleIdentifier, options?: BridgeExposeOptions | undefined): Promise<ModuleInstance[]> {
    this._noOverride('expose')
    assertEx(id !== '*', () => "Exposing '*' not supported")
    const addressToExpose = assertEx(await resolvePathToAddress(this, id), () => `Module to expose not found [${id}]`)
    console.log(`expose: ${addressToExpose}`)
    const modules = await this.exposeHandler(addressToExpose, options)
    await this.emit('exposed', { mod: this, modules })
    return modules
  }

  async exposed(): Promise<Address[]> {
    this._noOverride('exposed')
    return await this.exposedHandler()
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(): Promise<ModuleInstance[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>

  override async resolve<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const roots = (this._roots ?? []) as T[]
    const workingSet = (options.direction === 'up' ? [this as ModuleInstance] : [...roots, this]) as T[]
    if (id === '*') {
      const remainingDepth = (options.maxDepth ?? 5) - 1
      return remainingDepth <= 0
        ? workingSet
        : (
            [...workingSet, ...(await Promise.all(roots.map(mod => mod.resolve('*', { ...options, maxDepth: remainingDepth })))).flat()]
          )
    }
    switch (typeof id) {
      case 'string': {
        const parts = id.split(':')
        const first = assertEx(parts.shift(), () => 'Missing module identifier')
        const firstId = await transformModuleIdentifier(first, this.moduleIdentifierTransformers)
        const result = workingSet.find((mod) => {
          return firstId === mod.address || firstId === mod.modName
        })
        return parts.length === 0 ? result : result?.resolve(parts.join(':'), options)
      }
      default: {
        return
      }
    }
  }

  override async startHandler(): Promise<boolean> {
    if (this.discoverRoots === 'lazy') {
      forget(this.getRoots())
    } else if (this.discoverRoots === 'start') {
      await this.getRoots()
    }
    return true
  }

  async unexpose(id: ModuleIdentifier, options?: BridgeUnexposeOptions | undefined): Promise<Address[]> {
    this._noOverride('unexpose')
    const addressToUnexpose = assertEx(await resolvePathToAddress(this, id), () => `Module to unexpose not found [${id}]`)
    const modules = await this.unexposeHandler(addressToUnexpose, options)
    await this.emit('unexposed', { mod: this, modules })
    return modules.map(mod => mod.address)
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness>(
    query: T,
    payloads?: Payload[],
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<BridgeQueries>(query, payloads)
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
            for (const mod of modules) {
              const addressPayload: AddressPayload = {
                address: mod.address,
                schema: AddressSchema,
              }
              resultPayloads.push(addressPayload)
            }
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
            const moduleAddresses = await this.unexpose(id, options)
            for (const address of moduleAddresses) {
              const addressPayload: AddressPayload = {
                address,
                schema: AddressSchema,
              }
              resultPayloads.push(addressPayload)
            }
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

  protected override async resolveArchivingArchivists(): Promise<ArchivistInstance[]> {
    const archivists = this.archiving?.archivists
    if (!archivists) return []
    const resolvedAddresses = (
      await Promise.all(
        archivists.map(async archivist =>
          (await Promise.all((await this.parents()).map(parent => resolvePathToAddress(parent, archivist)))).filter(exists)),
      )
    )
      .flat()
      .filter(exists)
    const resolved = (await Promise.all(resolvedAddresses.map(address => resolveAddressToInstance(this, address)))).filter(exists)
    return resolved.map(mod => asArchivistInstance(mod)).filter(exists)
  }

  abstract exposeHandler(address: Address, options?: BridgeExposeOptions | undefined): Promisable<ModuleInstance[]>

  abstract exposedHandler(): Promisable<Address[]>

  abstract getRoots(force?: boolean): Promise<ModuleInstance[]>

  abstract unexposeHandler(address: Address, options?: BridgeUnexposeOptions | undefined): Promisable<ModuleInstance[]>
}
