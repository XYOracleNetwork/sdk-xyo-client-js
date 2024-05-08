import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { globallyUnique } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  AddressPreviousHashPayload,
  AttachableModuleInstance,
  duplicateModules,
  ModuleEventData,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleName,
  ModuleNameResolver,
  ModuleParams,
  ModuleQueryResult,
  ModuleStateQuery,
  ModuleStateQuerySchema,
  ObjectFilterOptions,
  ResolveHelper,
  ResolveHelperConfig,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import { asNodeInstance, NodeInstance } from '@xyo-network/node-model'
import { Payload, Query, WithMeta } from '@xyo-network/payload-model'

import { AbstractModule } from './AbstractModule'

export abstract class AbstractModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractModule<TParams, TEventData>
  implements AttachableModuleInstance<TParams, TEventData>, ModuleNameResolver
{
  static override readonly uniqueName = globallyUnique('AbstractModuleInstance', AbstractModuleInstance, 'xyo')

  private _downResolver?: CompositeModuleResolver
  private _parents: NodeInstance[] = []
  private _privateResolver?: CompositeModuleResolver
  private _upResolver?: CompositeModuleResolver

  constructor(privateConstructorKey: string, params: TParams, account: AccountInstance) {
    assertEx(AbstractModule.privateConstructorKey === privateConstructorKey, () => 'Use create function instead of constructor')
    // Clone params to prevent mutation of the incoming object
    const mutatedParams = { ...params } as TParams
    const addToResolvers = mutatedParams.addToResolvers ?? true
    super(privateConstructorKey, mutatedParams, account)
    if (addToResolvers) {
      this.upResolver.add(this)
      this.downResolver.add(this)
    }
  }

  get downResolver() {
    this._downResolver =
      this._downResolver ??
      new CompositeModuleResolver({
        allowNameResolution: this.allowNameResolution,
        moduleIdentifierTransformers: this.params.moduleIdentifierTransformers,
        root: this,
      })
    return this._downResolver
  }

  get localName() {
    return this.config.name
  }

  get moduleIdentifierTransformers() {
    return this.params.moduleIdentifierTransformers ?? ResolveHelper.transformers
  }

  get privateResolver() {
    this._privateResolver =
      this._privateResolver ??
      new CompositeModuleResolver({
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
    this._upResolver =
      this._upResolver ??
      new CompositeModuleResolver({
        allowNameResolution: this.allowNameResolution,
        moduleIdentifierTransformers: this.params.moduleIdentifierTransformers,
        root: this,
      })
    return this._upResolver
  }

  addParent(module: ModuleInstance) {
    const existingEntry = this._parents.find((parent) => parent.address === module.address)
    if (!existingEntry) {
      this._parents.push(asNodeInstance(module, 'Only NodeInstances can be parents'))
    }
  }

  async certifyParents(): Promise<WithMeta<Payload>[]> {
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

  moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    this._checkDead()
    return this.busy(async () => {
      return await this.moduleAddressHandler()
    })
  }

  parents(): Promisable<NodeInstance[]> {
    return this._parents
  }

  privateChildren(): Promisable<ModuleInstance[]> {
    return []
  }

  publicChildren(): Promisable<ModuleInstance[]> {
    return []
  }

  removeParent(address: Address) {
    this._parents = this._parents.filter((item) => item.address !== address)
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  async resolve(): Promise<ModuleInstance[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  /** @deprecated use '*' if trying to resolve all */
  async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const config: ResolveHelperConfig = {
      address: this.address,
      dead: this.dead,
      downResolver: this.downResolver,
      logger: this.logger,
      module: this,
      transformers: this.moduleIdentifierTransformers,
      upResolver: this.upResolver,
    }
    if (idOrFilter === '*') {
      return (await ResolveHelper.resolve(config, idOrFilter, options)).filter((mod) => mod.address !== this.address)
    }
    switch (typeof idOrFilter) {
      case 'string': {
        return await ResolveHelper.resolve(config, idOrFilter, options)
      }
      case 'object': {
        return (await ResolveHelper.resolve(config, idOrFilter, options)).filter((mod) => mod.address !== this.address)
      }
      default: {
        return (await ResolveHelper.resolve(config, idOrFilter, options)).filter((mod) => mod.address !== this.address)
      }
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
      (await this.privateResolver.resolve(id, options)) ??
      (await this.upResolver.resolve(id, options)) ??
      (await this.downResolver.resolve(id, options))
    )
  }

  async siblings(): Promise<ModuleInstance[]> {
    return (await Promise.all((await this.parents()).map((parent) => parent.publicChildren()))).flat().filter(duplicateModules)
  }

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
    const name = this.config.name ?? 'Anonymous'
    const children = await this.publicChildren()
    const childAddressToName: Record<Address, ModuleName | null> = {}
    for (const child of children) {
      if (child.address !== this.address) {
        childAddressToName[child.address] = child.config.name ?? null
      }
    }
    const result = {
      config: { name, ...this.config },
      schema: ModuleManifestPayloadSchema,
      status: { address: this.address, children: childAddressToName },
    }
    this._cachedManifests.set(maxDepth, result)
    return result
  }

  protected async resolveArchivingArchivists(): Promise<ArchivistInstance[]> {
    const archivists = this.config.archiving?.archivists
    if (!archivists) return []
    const resolved = await Promise.all(archivists.map((archivist) => this.resolve(archivist)))
    return compact(resolved.map((mod) => asArchivistInstance(mod)))
  }

  protected async sendQuery<T extends Query, P extends Payload = Payload, R extends Payload = Payload>(
    queryPayload: T,
    payloads?: P[],
    account?: AccountInstance,
  ): Promise<WithMeta<R>[]> {
    const queryResults = await this.sendQueryRaw(queryPayload, payloads, account)
    const [, resultPayloads, errors] = queryResults

    /* TODO: Figure out what to do with the returning BW.  Should we store them in a queue in case the caller wants to see them? */

    if (errors && errors.length > 0) {
      /* TODO: Figure out how to rollup multiple Errors */
      throw errors[0]
    }

    return resultPayloads as WithMeta<R>[]
  }

  protected async sendQueryRaw<T extends Query, P extends Payload = Payload, R extends Payload = Payload>(
    queryPayload: T,
    payloads?: P[],
    account?: AccountInstance,
  ): Promise<ModuleQueryResult<R>> {
    // Bind them
    const query = await this.bindQuery(queryPayload, payloads, account)

    // Send them off
    return (await this.query(query[0], query[1])) as ModuleQueryResult<R>
  }

  protected async storeToArchivists(payloads: Payload[]): Promise<Payload[]> {
    const archivists = await this.resolveArchivingArchivists()
    return (
      await Promise.all(
        archivists.map((archivist) => {
          return archivist.insert?.(payloads)
        }),
      )
    ).map(([bw]) => bw)
  }
}
