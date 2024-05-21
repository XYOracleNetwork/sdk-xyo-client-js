import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { EventListener } from '@xyo-network/module-events'
import {
  AnyConfigSchema,
  isAddressModuleFilter,
  isNameModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleLimitationViewLabel,
} from '@xyo-network/module-model'
import { SimpleModuleResolver } from '@xyo-network/module-resolver'
import { MemoryNode, NodeHelper } from '@xyo-network/node-memory'
import {
  asNodeInstance,
  AttachableNodeInstance,
  isNodeModule,
  NodeAttachQuerySchema,
  NodeConfig,
  NodeDetachQuerySchema,
  NodeModuleEventData,
  NodeParams,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { Schema } from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'

export const ViewNodeConfigSchema = 'network.xyo.node.view.config' as const
export type ViewNodeConfigSchema = typeof ViewNodeConfigSchema

export type ViewNodeConfig = NodeConfig<
  {
    ids: ModuleIdentifier[]
    source: ModuleIdentifier
  },
  ViewNodeConfigSchema
>

export type ViewNodeParams = NodeParams<AnyConfigSchema<ViewNodeConfig>>

export class ViewNode<TParams extends ViewNodeParams = ViewNodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends MemoryNode<TParams, TEventData>
  implements AttachableNodeInstance
{
  static override readonly configSchemas: Schema[] = [...super.configSchemas, ViewNodeConfigSchema]
  static override readonly defaultConfigSchema: Schema = ViewNodeConfigSchema
  static override readonly labels = { ...ModuleLimitationViewLabel }

  private _buildMutex = new Mutex()
  private _built = false
  private _limitedResolver = new SimpleModuleResolver({ root: this })

  get ids() {
    return this.config.ids
  }

  override get queries(): Schema[] {
    const disallowedQueries = new Set<Schema>([NodeAttachQuerySchema, NodeDetachQuerySchema, NodeRegisteredQuerySchema])
    const queries: Schema[] = [...super.queries]
    return queries.filter((query) => !disallowedQueries.has(query))
  }

  get source() {
    return this.config.source
  }

  async build() {
    return await this._buildMutex.runExclusive(async () => {
      const source = asNodeInstance(await super.resolve(this.source))
      if (source) {
        await Promise.all(
          this.ids.map(async (id) => {
            await NodeHelper.attachToExistingNode(source, id, this)
          }),
        )
        this._built = true
      }
    })
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(): Promise<ModuleInstance[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    if (!this._built) {
      await this.build()
    }
    const mods = await this._limitedResolver.resolve('*')
    if (idOrFilter === '*') {
      return mods as unknown as T[]
    }
    switch (typeof idOrFilter) {
      case 'string': {
        const mod = mods.find((mod) => mod.modName === idOrFilter || mod.address === idOrFilter)
        return mod as unknown as T
      }
      case 'object': {
        if (isAddressModuleFilter(idOrFilter)) {
          return (await Promise.all(idOrFilter.address.map(async (address) => await this.resolve(address, options)))).filter(exists)
        } else if (isNameModuleFilter(idOrFilter)) {
          return (await Promise.all(idOrFilter.name.map(async (name) => await this.resolve(name, options)))).filter(exists)
        }
        return []
      }
    }
  }

  protected override async attachUsingAddress(address: Address) {
    const attached = await this.attached()
    const mods = this.registeredModules().filter((mod) => attached.includes(mod.address))
    const existingModule = mods.find((mod) => mod.address === address)
    assertEx(!existingModule, () => `Module [${existingModule?.modName ?? existingModule?.address}] already attached at address [${address}]`)
    const module = this.registeredModuleMap[address]

    if (!module) {
      return
    }

    module.addParent(this)

    const args = { module, name: module.modName }
    await this.emit('moduleAttached', args)

    this._limitedResolver.add(module)

    if (isNodeModule(module)) {
      const attachedListener: EventListener<TEventData['moduleAttached']> = async (args: TEventData['moduleAttached']) =>
        await this.emit('moduleAttached', args)

      const detachedListener: EventListener<TEventData['moduleDetached']> = async (args: TEventData['moduleDetached']) =>
        await this.emit('moduleDetached', args)

      module.on('moduleAttached', attachedListener)
      module.on('moduleDetached', detachedListener)
    }

    return address
  }

  protected override async attachedPublicModules(): Promise<ModuleInstance[]> {
    return (await this._limitedResolver.resolve('*')).filter((module) => module.address !== this.address)
  }

  protected override async detachUsingAddress(address: Address) {
    const module = await this.downResolver.resolve(address)
    if (module) {
      this._limitedResolver.remove(address)
      return address
    }
  }

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    await this.build()
    return true
  }
}
