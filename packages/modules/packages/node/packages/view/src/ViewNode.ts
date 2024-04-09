import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { AnyConfigSchema, ModuleFilter, ModuleFilterOptions, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'
import { MemoryNode, NodeHelper } from '@xyo-network/node-memory'
import { asNodeInstance, AttachableNodeInstance, NodeConfig, NodeModuleEventData, NodeParams } from '@xyo-network/node-model'

export const ViewNodeConfigSchema = 'network.xyo.node.view.config'
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
  static override configSchemas = [ViewNodeConfigSchema]

  get ids() {
    return this.config.ids
  }

  get source() {
    return this.config.source
  }

  async build() {
    const source = asNodeInstance(await this.resolve(this.source))
    if (source) {
      await Promise.all(
        this.ids.map(async (id) => {
          await NodeHelper.attachToExistingNode(source, id, this)
        }),
      )
    }
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(): Promise<ModuleInstance[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter, options?: ModuleFilterOptions<T>): Promise<T[]>
  override async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  override async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    _options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const attached = await this.attached()
    const mods = this.registeredModules().filter((mod) => attached.includes(mod.address))
    if (idOrFilter === '*') {
      return mods as unknown as T[]
    }
    switch (typeof idOrFilter) {
      case 'string': {
        const mod = mods.find((mod) => mod.config.name === idOrFilter && mod.address === idOrFilter)
        return mod as unknown as T
      }
      case 'object': {
        return []
      }
    }
  }

  protected override async attachUsingAddress(address: Address) {
    const existingModule = (await this.resolve({ address: [address] })).pop()
    assertEx(!existingModule, () => `Module [${existingModule?.config.name ?? existingModule?.address}] already attached at address [${address}]`)
    const module = this.registeredModuleMap[address]

    if (!module) {
      return
    }

    this.downResolver.add(module)

    return address
  }

  protected override async detachUsingAddress(address: Address) {
    const module = await this.downResolver.resolve(address)
    if (module) {
      this.downResolver.remove(address)
      return address
    }
  }

  protected override async startHandler(): Promise<boolean> {
    this.downResolver.allowAddResolver = false
    this.upResolver.allowAddResolver = false
    await super.startHandler()
    this.upResolver.priority = -1
    this.downResolver.priority = -1
    await this.build()
    return true
  }
}
