import { assertEx } from '@xylabs/assert'
import type { EventListener } from '@xylabs/events'
import type { Address } from '@xylabs/hex'
import type {
  AnyConfigSchema,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
} from '@xyo-network/module-model'
import { ModuleLimitationViewLabel } from '@xyo-network/module-model'
import { SimpleModuleResolver } from '@xyo-network/module-resolver'
import { MemoryNode, MemoryNodeHelper } from '@xyo-network/node-memory'
import type {
  AttachableNodeInstance,
  NodeConfig,
  NodeModuleEventData,
  NodeParams,
} from '@xyo-network/node-model'
import {
  asNodeInstance,
  isNodeModule,
  NodeAttachQuerySchema,
  NodeDetachQuerySchema,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import type { Schema } from '@xyo-network/payload-model'
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
  implements AttachableNodeInstance {
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
    return queries.filter(query => !disallowedQueries.has(query))
  }

  get source() {
    return this.config.source
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(): Promise<ModuleInstance[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleIdentifier = '*',
    _options: ModuleFilterOptions<T> = {},
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
        const mod = mods.find(mod => mod.modName === idOrFilter || mod.address === idOrFilter)
        return mod as unknown as T
      }
    }
  }

  protected override async attachUsingAddress(address: Address) {
    const attached = await this.attached()
    const mods = this.registeredModules().filter(mod => attached.includes(mod.address))
    const existingModule = mods.find(mod => mod.address === address)
    if (existingModule) {
      this.logger?.warn(`ViewNode: Module [${existingModule?.modName ?? existingModule?.address}] already attached at address [${address}]`)
    }
    const mod = assertEx(this.registeredModuleMap[address], () => `Module [${address}] not found in registered mods`)

    mod.addParent(this)

    const args = { mod, name: mod.modName }
    await this.emit('moduleAttached', args)

    this._limitedResolver.add(mod)

    if (isNodeModule(mod)) {
      const attachedListener: EventListener<TEventData['moduleAttached']> = async (args: TEventData['moduleAttached']) =>
        await this.emit('moduleAttached', args)

      const detachedListener: EventListener<TEventData['moduleDetached']> = async (args: TEventData['moduleDetached']) =>
        await this.emit('moduleDetached', args)

      mod.on('moduleAttached', attachedListener)
      mod.on('moduleDetached', detachedListener)
    }

    return address
  }

  protected override async attachedPublicModules(): Promise<ModuleInstance[]> {
    return (await this._limitedResolver.resolve('*')).filter(mod => mod.address !== this.address)
  }

  protected override async detachUsingAddress(address: Address) {
    const mod = assertEx(await this.downResolver.resolve(address), () => `Module [${address}] not found in down resolver`)
    this._limitedResolver.remove(mod.address)
    return address
  }

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    await this.build()
    return true
  }

  private async build() {
    return await this._buildMutex.runExclusive(async () => {
      if (!this._built) {
        const source = asNodeInstance(await super.resolve(this.source))
        if (source) {
          await Promise.all(
            this.ids.map(async (id) => {
              await MemoryNodeHelper.attachToExistingNode(source, id, this)
            }),
          )
          this._built = true
        }
      }
    })
  }
}
