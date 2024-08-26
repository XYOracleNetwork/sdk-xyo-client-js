import { assertEx } from '@xylabs/assert'
import { merge } from '@xylabs/lodash'
import type { Logger } from '@xylabs/logger'
import type { Schema } from '@xyo-network/payload-model'

import type { AttachableModuleInstance } from '../instance/index.ts'
import type { Labels, WithOptionalLabels } from '../Labels/index.ts'
import type { CreatableModule, CreatableModuleFactory } from './CreatableModule.ts'

export class ModuleFactory<TModule extends AttachableModuleInstance> implements CreatableModuleFactory<TModule> {
  configSchemas: CreatableModuleFactory<TModule>['configSchemas']

  creatableModule: CreatableModule<TModule>

  defaultConfigSchema: Schema

  defaultLogger?: Logger | undefined

  defaultParams?: Omit<TModule['params'], 'config'> & { config?: Partial<TModule['params']['config']> }

  labels?: Labels

  constructor(
    creatableModule: CreatableModule<TModule>,
    params?: Omit<TModule['params'], 'config'> & { config?: Partial<TModule['params']['config']> },
    labels: Labels = {},
  ) {
    this.creatableModule = creatableModule
    this.defaultParams = params
    this.configSchemas = creatableModule.configSchemas
    this.defaultConfigSchema = creatableModule.defaultConfigSchema
    assertEx(this.configSchemas.includes(this.defaultConfigSchema), () => 'defaultConfigSchema must be in configSchemas')
    this.labels = Object.assign({}, (creatableModule as WithOptionalLabels).labels ?? {}, labels ?? {})
  }

  static withParams<T extends AttachableModuleInstance>(
    creatableModule: CreatableModule<T>,
    params?: Omit<T['params'], 'config'> & { config?: T['params']['config'] },
    labels: Labels = {},
  ) {
    return new ModuleFactory(creatableModule, params, labels)
  }

  _getRootFunction(funcName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let anyThis = this as any
    while (anyThis.__proto__[funcName]) {
      anyThis = anyThis.__proto__
    }
    return anyThis[funcName]
  }

  _noOverride(functionName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thisFunc = (this as any)[functionName]

    const rootFunc = this._getRootFunction(functionName)
    assertEx(thisFunc === rootFunc, () => `Override not allowed for [${functionName}] - override ${functionName}Handler instead`)
  }

  create<T extends AttachableModuleInstance>(this: CreatableModuleFactory<T>, params: TModule['params'] | undefined): Promise<T> {
    const factory = this as ModuleFactory<T>
    const schema = factory.creatableModule.defaultConfigSchema
    const mergedParams: TModule['params'] = merge(
      {},
      factory.defaultParams,
      params,
      { config: merge({}, factory.defaultParams?.config, params?.config, { schema }) },
    )
    return factory.creatableModule.create<T>(mergedParams)
  }

  factory<T extends AttachableModuleInstance>(this: CreatableModule<T>, _params?: T['params'] | undefined): CreatableModuleFactory<T> {
    throw new Error('Method not implemented.')
  }
}
