import { Module, ModuleParams } from '@xyo-network/module-model'

export interface CreatableModule<TCreatableParams extends ModuleParams = ModuleParams> {
  configSchema: string
  create(params?: TCreatableParams): Promise<Module>
}

/**
 * Class annotation to be used to decorate Modules which support
 * an asynchronous creation pattern
 * @returns The decorated Module requiring it implement the members
 * of the CreatableModule as statics properties/methods
 */
export function creatableModule() {
  return <U extends CreatableModule>(constructor: U) => {
    constructor
  }
}
