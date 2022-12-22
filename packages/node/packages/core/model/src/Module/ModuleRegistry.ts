import { Module } from '@xyo-network/module-model'

export interface ModuleRegistry {
  /**
   * Lists all modules registered to this registry
   */
  listModules?: () => Promise<string[]>

  /**
   * Called when a module is added to the registry
   */
  onModuleAdded?: (address: string, module: Module) => Promise<void>

  /**
   * Called to add a module to the registry
   */
  addModule(address: string, module: Module): Promise<void>
  /**
   * Retrieves a module that's been added to the registry
   * @param address The address for the module
   * @returns The module at the address or undefined if no module
   * exists at that address
   */
  getModule(address: string): Promise<Module | undefined>

  /**
   * Returns true if the module is registered with the
   * registry, false otherwise
   * @param address The address for the module
   */
  hasModule(address: string): Promise<boolean>
}
