import { Logger } from '@xyo-network/core'
import { CreatableModule, CreatableModuleFactory, Module } from '@xyo-network/module-model'
import merge from 'lodash/merge'

export interface CreatableModuleDictionary {
  [key: string]: CreatableModuleFactory
}

export class ModuleFactory<TModule extends Module> implements CreatableModuleFactory<TModule> {
  configSchema: CreatableModuleFactory<TModule>['configSchema']

  creatableModule: CreatableModule<TModule>

  defaultLogger?: Logger | undefined

  defaultParams?: TModule['params']

  constructor(creatableModule: CreatableModule<TModule>, params?: TModule['params']) {
    this.creatableModule = creatableModule
    this.defaultParams = params
    this.configSchema = creatableModule.configSchema
  }

  static withParams<T extends Module>(creatableModule: CreatableModule<T>, params?: T['params']) {
    return new ModuleFactory(creatableModule, params)
  }

  create<T extends Module>(this: CreatableModuleFactory<T>, params?: TModule['params'] | undefined): Promise<T> {
    const factory = this as ModuleFactory<T>
    const mergedParams = merge(factory.defaultParams ?? {}, params)
    return factory.creatableModule.create<T>(mergedParams)
  }

  factory<T extends Module>(this: CreatableModule<T>, _params?: T['params'] | undefined): CreatableModuleFactory<T> {
    throw new Error('Method not implemented.')
  }
}
