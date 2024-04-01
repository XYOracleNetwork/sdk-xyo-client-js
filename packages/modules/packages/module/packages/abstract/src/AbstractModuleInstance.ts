import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { globallyUnique } from '@xylabs/object'
import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import {
  AddressPreviousHashPayload,
  ModuleEventData,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleNameResolver,
  ModuleParams,
  ObjectFilterOptions,
} from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { AbstractModule } from './AbstractModule'
import { ResolveHelper, ResolveHelperConfig } from './ResolveHelper'

export abstract class AbstractModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractModule<TParams, TEventData>
  implements ModuleInstance<TParams, TEventData>, ModuleNameResolver
{
  static override readonly uniqueName = globallyUnique('AbstractModuleInstance', AbstractModuleInstance, 'xyo')
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

  manifest(maxDepth?: number, ignoreAddresses?: Address[]): Promise<ModuleManifestPayload> {
    this._checkDead()
    return this.busy(async () => {
      return await this.manifestHandler(maxDepth, ignoreAddresses)
    })
  }

  moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    this._checkDead()
    return this.busy(async () => {
      return await this.moduleAddressHandler()
    })
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

  state() {
    this._checkDead()
    return this.busy(async () => {
      return await this.stateHandler()
    })
  }

  subscribe(_queryAccount?: AccountInstance) {
    this._checkDead()
    return this.subscribeHandler()
  }

  protected async resolveArchivingArchivists(): Promise<ArchivistInstance[]> {
    const archivists = this.config.archiving?.archivists
    if (!archivists) return []
    const resolved = await Promise.all(archivists.map((archivist) => this.resolve(archivist)))
    return compact(resolved.map((mod) => asArchivistInstance(mod)))
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
