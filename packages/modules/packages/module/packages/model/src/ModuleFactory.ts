import { Logger } from '@xyo-network/logger'
import merge from 'lodash/merge'

import { CreatableModule, CreatableModuleFactory } from './CreatableModule'
import { Module } from './module'

export class ModuleFactory<TModule extends Module> implements CreatableModuleFactory<TModule> {
  configSchemas: CreatableModuleFactory<TModule>['configSchemas']

  creatableModule: CreatableModule<TModule>

  defaultLogger?: Logger | undefined

  defaultParams?: Omit<TModule['params'], 'config'> & { config?: TModule['params']['config'] }

  constructor(creatableModule: CreatableModule<TModule>, params?: Omit<TModule['params'], 'config'> & { config?: TModule['params']['config'] }) {
    this.creatableModule = creatableModule
    this.defaultParams = params
    this.configSchemas = creatableModule.configSchemas
  }

  get configSchema(): string {
    return this.configSchemas[0]
  }

  static withParams<T extends Module>(
    creatableModule: CreatableModule<T>,
    params?: Omit<T['params'], 'config'> & { config?: T['params']['config'] },
  ) {
    return new ModuleFactory(creatableModule, params)
  }

  create<T extends Module>(this: CreatableModuleFactory<T>, params?: TModule['params'] | undefined): Promise<T> {
    const factory = this as ModuleFactory<T>
    const schema = factory.creatableModule.configSchema
    const mergedParams: TModule['params'] = merge(factory.defaultParams ?? {}, params, { config: { schema } })
    return factory.creatableModule.create<T>(mergedParams)
  }

  factory<T extends Module>(this: CreatableModule<T>, _params?: T['params'] | undefined): CreatableModuleFactory<T> {
    throw new Error('Method not implemented.')
  }
}
