import { assertEx } from '@xylabs/assert'
import { globallyUnique } from '@xylabs/base'
import type { CreatableInstance } from '@xylabs/creatable'
import { exists } from '@xylabs/exists'
import type { Address } from '@xylabs/hex'
import type { TypeCheck } from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import { isDefined, type TypedValue } from '@xylabs/typeof'
import type { AccountInstance } from '@xyo-network/account-model'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import type { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import type {
  AddressPayload,
  AddressPreviousHashPayload,
  AttachableModuleInstance,
  Module,
  ModuleEventData,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleManifestQuery,
  ModuleName,
  ModuleNameResolver,
  ModuleParams,
  ModuleQueryResult,
  ModuleStateQuery,
  ObjectFilterOptions,
  ResolveHelperConfig,
} from '@xyo-network/module-model'
import {
  duplicateModules,
  ModuleManifestQuerySchema,
  ModuleStateQuerySchema,
  resolveAll,
  resolveAllDown,
  resolveAllUp,
  ResolveHelper,
  resolvePathToInstance,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import type { NodeInstance } from '@xyo-network/node-model'
import { asNodeInstance } from '@xyo-network/node-model'
import type { Payload, Query } from '@xyo-network/payload-model'

import { AbstractModule } from './AbstractModule.ts'

function filterIdentity<T extends TypedValue>(mod?: ModuleInstance, identityFunc?: TypeCheck<T>): T
function filterIdentity<T extends TypedValue>(mods?: ModuleInstance[], identityFunc?: TypeCheck<T>): T[]
function filterIdentity<T extends TypedValue>(mod?: ModuleInstance | ModuleInstance[], identityFunc?: TypeCheck<T>) {
  if (Array.isArray(mod)) {
    if (identityFunc) {
      return mod.map(m => identityFunc(m)).filter(exists)
    }
    return mod
  }
  return (mod ? (identityFunc ? identityFunc(mod) : true) : false) ? mod : undefined
}

export abstract class AbstractModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractModule<TParams, TEventData>
  implements AttachableModuleInstance<TParams, TEventData>, ModuleNameResolver {
  static override readonly uniqueName = globallyUnique('AbstractModuleInstance', AbstractModuleInstance, 'xyo')

  // switches between old and new resolution system
  static readonly useNewResolver = false

  private _downResolver?: CompositeModuleResolver
  private _parents: NodeInstance[] = []
  private _privateResolver?: CompositeModuleResolver
  private _upResolver?: CompositeModuleResolver

  get downResolver() {
    this._downResolver
      = this._downResolver
        ?? new CompositeModuleResolver({
          allowNameResolution: this.allowNameResolution,
          moduleIdentifierTransformers: this.params.moduleIdentifierTransformers,
          root: this,
        })
    return this._downResolver
  }

  override get modName() {
    return super.modName
  }

  get moduleIdentifierTransformers() {
    return this.params.moduleIdentifierTransformers ?? ResolveHelper.transformers
  }

  get privateResolver() {
    this._privateResolver
      = this._privateResolver
        ?? new CompositeModuleResolver({
          allowNameResolution: this.allowNameResolution,
          moduleIdentifierTransformers: this.params.moduleIdentifierTransformers,
          root: this,
        })
    return this._privateResolver
  }

  get root() {
    return this
  }

  get upResolver() {
    this._upResolver
      = this._upResolver
        ?? new CompositeModuleResolver({
          allowNameResolution: this.allowNameResolution,
          moduleIdentifierTransformers: this.params.moduleIdentifierTransformers,
          root: this,
        })
    return this._upResolver
  }

  addParent(mod: ModuleInstance) {
    const existingEntry = this._parents.find(parent => parent.address === mod.address)
    if (!existingEntry) {
      this._parents.push(asNodeInstance(mod, 'Only NodeInstances can be parents', { required: true }))
    }
  }

  async certifyParents(): Promise<Payload[]> {
    const parents = await this.parents()
    return (
      await Promise.all(
        parents.map(async (parent) => {
          const [bw, payloads, errors] = await parent.certifyQuery(this.address)
          return errors.length === 0 ? [bw, ...payloads] : []
        }),
      )
    ).flat()
  }

  override createHandler() {
    const params = super.createHandler()
    const addToResolvers = this.params?.addToResolvers ?? true
    if (addToResolvers) {
      this.upResolver.add(this)
      this.downResolver.add(this)
    }
    return params
  }

  manifest(maxDepth?: number): Promise<ModuleManifestPayload> {
    this._checkDead()
    return this.busy(async () => {
      return await this.manifestHandler(maxDepth)
    })
  }

  async manifestQuery(account: AccountInstance, maxDepth?: number): Promise<ModuleQueryResult<ModuleManifestPayload>> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth === undefined ? {} : { maxDepth }) }
    return await this.sendQueryRaw<ModuleManifestQuery, Payload, ModuleManifestPayload>(queryPayload, undefined, account)
  }

  moduleAddress(): Promise<(AddressPayload | AddressPreviousHashPayload)[]> {
    this._checkDead()
    return this.busy(async () => {
      return await this.moduleAddressHandler()
    })
  }

  parents(): Promisable<NodeInstance[]> {
    return this._parents
  }

  privateChildren(): Promisable<ModuleInstance[]> {
    return [...this.params.privateChildren ?? []]
  }

  publicChildren(): Promisable<ModuleInstance[]> {
    return [...this.params.publicChildren ?? []]
  }

  removeParent(address: Address) {
    this._parents = this._parents.filter(item => item.address !== address)
  }

  async resolve(): Promise<ModuleInstance[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    if (AbstractModuleInstance.useNewResolver) {
      if (id === '*') {
        const { maxDepth = 10, direction } = options
        if (direction === 'down') {
          return filterIdentity<T>((await resolveAllDown(this, maxDepth)) ?? [], options.identity)
        }
        if (direction === 'up') {
          return filterIdentity<T>(await resolveAllUp(this, maxDepth) ?? [], options.identity)
        }
        return filterIdentity<T>(await resolveAll(this, maxDepth) ?? [], options.identity)
      } else if (typeof id === 'string') {
        return filterIdentity<T>(await resolvePathToInstance(this, id, true), options.identity)
      } else {
        throw new TypeError('Invalid id type')
      }
    } else {
      const config: ResolveHelperConfig = {
        address: this.address,
        dead: this.dead,
        downResolver: this.downResolver,
        logger: this.logger,
        mod: this,
        transformers: this.moduleIdentifierTransformers,
        upResolver: this.upResolver,
      }
      if (id === '*') {
        return filterIdentity<T>(await ResolveHelper.resolve(config, id, options) ?? [], options.identity)
      }
      return filterIdentity<T>(await ResolveHelper.resolve(config, id, options), options.identity)
    }
  }

  resolveIdentifier(id: ModuleIdentifier, options?: ObjectFilterOptions): Promise<Address | undefined> {
    const { direction = 'all' } = options ?? {}
    switch (direction) {
      case 'down': {
        return this.downResolver.resolveIdentifier(id, options)
      }
      default: {
        const mutatedOptions = { ...options, direction: 'all' } as ObjectFilterOptions
        return this.upResolver.resolveIdentifier(id, mutatedOptions)
      }
    }
  }

  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    return (
      (await this.privateResolver.resolve(id, options))
      ?? (await this.upResolver.resolve(id, options))
      ?? (await this.downResolver.resolve(id, options))
    )
  }

  async siblings(): Promise<ModuleInstance[]> {
    return (await Promise.all((await this.parents()).map(parent => parent.publicChildren()))).flat().filter(duplicateModules)
  }

  /* override start(_timeout?: number): Promisable<boolean> {
    if (this.parents.length === 0) {
      this.logger.warn(`Module is being started without being attached to a parent: ${this.id} [${this.address}]`)
    }
    return super.start()
  } */

  state() {
    this._checkDead()
    return this.busy(async () => {
      return await this.stateHandler()
    })
  }

  async stateQuery(account: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ModuleStateQuery = { schema: ModuleStateQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  subscribe(_queryAccount?: AccountInstance) {
    this._checkDead()
    return this.subscribeHandler()
  }

  protected override async manifestHandler(maxDepth: number = 1, _ignoreAddresses: Address[] = []): Promise<ModuleManifestPayload> {
    const cachedResult = this._cachedManifests.get(maxDepth)
    if (cachedResult) {
      return cachedResult
    }
    const modName = this.modName ?? '<Anonymous>'
    const children = await this.publicChildren()
    const childAddressToName: Record<Address, ModuleName | null> = {}
    for (const child of children) {
      if (child.address !== this.address) {
        childAddressToName[child.address] = child.modName ?? null
      }
    }
    const result = {
      config: { name: modName, ...this.config },
      name: modName,
      schema: ModuleManifestPayloadSchema,
      status: { address: this.address, children: childAddressToName },
    }
    this._cachedManifests.set(maxDepth, result)
    return result
  }

  protected async resolveArchivingArchivists(): Promise<ArchivistInstance[]> {
    const archivists = this.archiving?.archivists
    if (!archivists) return []
    const resolved = await Promise.all(archivists.map(archivist => this.resolve(archivist)))
    return (resolved.map(mod => asArchivistInstance(mod))).filter(exists)
  }

  protected async sendQuery<T extends Query, P extends Payload = Payload, R extends Payload = Payload>(
    queryPayload: T,
    payloads?: P[],
    account?: AccountInstance,
  ): Promise<R[]> {
    const queryResults = await this.sendQueryRaw(queryPayload, payloads, account)
    const [, resultPayloads, errors] = queryResults

    /* TODO: Figure out what to do with the returning BW.  Should we store them in a queue in case the caller wants to see them? */

    if (isDefined(errors) && errors.length > 0) {
      /* TODO: Figure out how to rollup multiple Errors */
      throw errors[0]
    }

    return resultPayloads as R[]
  }

  protected async sendQueryRaw<T extends Query, P extends Payload = Payload, R extends Payload = Payload>(
    queryPayload: T,
    payloads?: P[],
    account?: AccountInstance,
  ): Promise<ModuleQueryResult<R>> {
    // Bind them
    const query = await this.bindQuery(queryPayload, payloads, account, this.additionalSigners)

    // Send them off
    return (await this.query(query[0], query[1])) as ModuleQueryResult<R>
  }

  protected async storeToArchivists(payloads: Payload[]): Promise<Payload[]> {
    try {
      const archivists = await this.resolveArchivingArchivists()
      return (
        await Promise.all(
          archivists.map((archivist) => {
            return archivist.insert?.(payloads)
          }),
        )
      ).map(([bw]) => bw)
    } catch (ex) {
      const error = ex as Error
      this.logger?.error(`Error storing to archivists: ${error.message}`)
      return []
    }
  }
}
