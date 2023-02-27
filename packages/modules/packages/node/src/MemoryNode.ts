import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilled, rejected } from '@xylabs/promise'
import { duplicateModules, Module, ModuleFilter } from '@xyo-network/module'

import { AbstractNode, AbstractNodeParams } from './AbstractNode'
import { NodeConfig, NodeConfigSchema } from './Config'

export type MemoryNodeParams<TConfig extends NodeConfig = NodeConfig> = AbstractNodeParams<TConfig>

export class MemoryNode<TConfig extends NodeConfig = NodeConfig> extends AbstractNode<TConfig> {
  static override configSchema = NodeConfigSchema

  private registeredModuleMap = new Map<string, Module>()

  static override async create(params?: Partial<MemoryNodeParams>): Promise<MemoryNode> {
    return (await super.create(params)) as MemoryNode
  }

  override async attach(address: string, external?: boolean) {
    const existingModule = (await this.resolve({ address: [address] })).pop()
    assertEx(!existingModule, `Module [${existingModule?.config.name ?? existingModule?.address}] already attached at address [${address}]`)
    const module = assertEx(this.registeredModuleMap.get(address), 'No module registered at that address')

    this.privateResolver.addResolver(module.downResolver)

    //give it inside access
    module.upResolver.addResolver?.(this.privateResolver)

    //give it outside access
    module.upResolver.addResolver?.(this.upResolver)

    if (external) {
      //expose it externally
      this.downResolver.addResolver(module.downResolver)
    }

    const args = { module, name: module.config.name }
    this.moduleAttachedEventListeners?.map((listener) => listener(args))
  }

  override detach(address: string) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')

    this.upResolver.removeResolver(module.upResolver)

    //remove outside access
    module.upResolver?.removeResolver?.(this.upResolver)

    //remove inside access
    module.upResolver?.removeResolver?.(this.privateResolver)

    //remove external exposure
    this.downResolver.removeResolver(module.downResolver)

    const args = { module, name: module.config.name }
    this.moduleDetachedEventListeners?.map((listener) => listener(args))
  }

  override register(module: Module) {
    assertEx(!this.registeredModuleMap.get(module.address), `Module already registered at that address[${module.address}]`)
    this.registeredModuleMap.set(module.address, module)
    return this
  }

  override registered() {
    return Object.values(this.registeredModuleMap).map((value) => {
      return value
    })
  }

  override registeredModules() {
    return Array.from(this.registeredModuleMap.values()).map((value) => {
      return value
    })
  }

  override async resolve(filter?: ModuleFilter): Promise<Module[]> {
    const internal: Promise<Module[]> = this.privateResolver.resolve(filter)
    const external: Promise<Module[]> = this.upResolver?.resolve(filter) || []
    const local: Promise<Module[]> = this.downResolver?.resolve(filter) || []
    const resolved = await Promise.allSettled([internal, external, local])

    const errors = resolved.filter(rejected).map((r) => Error(r.reason))

    if (errors.length) {
      this.logger?.error(`Resolve Errors: ${JSON.stringify(errors, null, 2)}`)
    }

    return resolved
      .filter(fulfilled)
      .map((r) => r.value)
      .flat()
      .filter(exists)
      .filter(duplicateModules)
  }

  override unregister(module: Module) {
    this.detach(module.address)
    this.registeredModuleMap.delete(module.address)
    return this
  }
}
