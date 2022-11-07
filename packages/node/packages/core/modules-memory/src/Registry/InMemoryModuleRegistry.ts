import { Module } from '@xyo-network/module'
import { ModuleRegistry } from '@xyo-network/node-core-model'
import LruCache from 'lru-cache'

// TODO: Modules shouldn't age out but memory is a finite resource. Could
// do something like re-initialize LRU modules.
// TODO: Call destroy query on un-initialize
/**
 * The number of registered modules to keep
 * in the cache
 */
const max = 10000

export class InMemoryModuleRegistry implements ModuleRegistry {
  public onModuleAdded?: (address: string, module: Module) => Promise<void>
  protected registry = new LruCache<string, Module>({ max })

  public async addModule(address: string, module: Module): Promise<void> {
    this.registry.set(address, module)
    if (this.onModuleAdded) {
      await this.onModuleAdded(address, module)
    }
  }

  public getModule(address: string): Promise<Module | undefined> {
    const module = this.registry.get(address)
    return Promise.resolve(module)
  }

  public hasModule(address: string): Promise<boolean> {
    return Promise.resolve(this.registry.has(address))
  }
}
