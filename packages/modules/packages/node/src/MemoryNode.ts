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

    this.internalResolver.addResolver(module.resolver)

    //give it inside access
    module.parentResolver?.addResolver?.(this.internalResolver)

    //give it outside access
    if (this.parentResolver) {
      module.parentResolver?.addResolver?.(this.parentResolver)
    }

    if (external) {
      //expose it externally
      this.resolver.addResolver(module.resolver)
    }

    const args = { module, name: module.config.name }
    this.moduleAttachedEventListeners?.map((listener) => listener(args))
  }

  override detach(address: string) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')

    this.internalResolver.removeResolver(module.resolver)

    //remove outside access
    module.parentResolver?.removeResolver?.(this.parentResolver)

    //remove inside access
    module.parentResolver?.removeResolver?.(this.internalResolver)

    //remove external exposure
    this.resolver.removeResolver(module.resolver)

    const args = { module, name: module.config.name }
    this.moduleDetachedEventListeners?.map((listener) => listener(args))
  }

  override register(module: Module) {
    assertEx(!this.registeredModuleMap.get(module.address), `Module already registered at that address[${module.address}]`)
    this.registeredModuleMap.set(module.address, module)
    return this
  }

  override registered() {
    return Array.from(this.registeredModuleMap.keys()).map((key) => {
      return key
    })
  }

  override registeredModules() {
    return Array.from(this.registeredModuleMap.values()).map((value) => {
      return value
    })
  }

  override async resolve(filter?: ModuleFilter): Promise<Module[]> {
    const internal: Promise<Module[]> = this.internalResolver.resolve(filter)
    const external: Promise<Module[]> = this.parentResolver?.resolve(filter) || []
    const local: Promise<Module[]> = this.resolver?.resolve(filter) || []
    const resolved = await Promise.allSettled([internal, external, local])

    const errors = resolved.filter(rejected).map((r) => Error(r.reason))

    if (errors) {
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
