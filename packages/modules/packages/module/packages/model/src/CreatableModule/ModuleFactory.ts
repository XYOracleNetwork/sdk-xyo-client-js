import { assertEx } from '@xylabs/assert'
import type { Logger } from '@xylabs/logger'
import type { Schema } from '@xyo-network/payload-model'

import type { Labels, WithOptionalLabels } from '../Labels/index.ts'
import type {
  CreatableModule, CreatableModuleFactory, CreatableModuleInstance,
} from './CreatableModule.ts'

export class ModuleFactory<TModule extends CreatableModuleInstance> implements CreatableModuleFactory<TModule> {
  configSchemas: CreatableModule<TModule>['configSchemas']

  creatableModule: CreatableModule<TModule>

  defaultConfigSchema: Schema

  defaultLogger?: Logger

  defaultParams?: Partial<TModule['params']>

  labels?: Labels

  constructor(
    creatableModule: CreatableModule<TModule>,
    params?: Partial<TModule['params']>,
    labels: Labels = {},
  ) {
    this.creatableModule = creatableModule
    this.defaultParams = params
    this.configSchemas = creatableModule.configSchemas
    this.defaultConfigSchema = creatableModule.defaultConfigSchema
    assertEx(this.configSchemas.includes(this.defaultConfigSchema), () => 'defaultConfigSchema must be in configSchemas')
    this.labels = Object.assign({}, (creatableModule as WithOptionalLabels).labels ?? {}, labels ?? {})
  }

  static withParams<T extends CreatableModuleInstance>(
    creatableModule: CreatableModule<T>,
    params?: Partial<T['params']>,
    labels: Labels = {},
  ) {
    return new ModuleFactory(creatableModule, params, labels)
  }

  create<T extends CreatableModuleInstance>(this: CreatableModuleFactory<T>, params: Partial<TModule['params']>): Promise<T> {
    const factory = this as CreatableModuleFactory<T>
    const schema = factory.creatableModule.defaultConfigSchema
    const mergedParams: TModule['params'] = {
      ...factory.defaultParams,
      ...params,
      config: {
        ...factory.defaultParams?.config, ...params.config, schema,
      },
    } as TModule['params']
    return factory.creatableModule.create<T>(mergedParams)
  }

  factory<T extends CreatableModuleInstance>(this: CreatableModuleFactory<T>, _params?: Partial<T['params']> | undefined): CreatableModuleFactory<T> {
    throw new Error('Method not implemented.')
  }
}
