import { assertEx } from '@xylabs/assert'
import { merge } from '@xylabs/lodash'
import { Logger } from '@xyo-network/logger'

import { ModuleInstance } from '../instance'
import { Labels, WithOptionalLabels } from '../Labels'
import { CreatableModule, CreatableModuleFactory } from './CreatableModule'

export class ModuleFactory<TModule extends ModuleInstance> implements CreatableModuleFactory<TModule> {
  configSchemas: CreatableModuleFactory<TModule>['configSchemas']

  creatableModule: CreatableModule<TModule>

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
    this.labels = Object.assign({}, (creatableModule as WithOptionalLabels).labels ?? {}, labels ?? {})
  }

  get configSchema(): string {
    return this.configSchemas[0]
  }

  static withParams<T extends ModuleInstance>(
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootFunc = this._getRootFunction(functionName)
    assertEx(thisFunc === rootFunc, `Override not allowed for [${functionName}] - override ${functionName}Handler instead`)
  }

  create<T extends ModuleInstance>(this: CreatableModuleFactory<T>, params?: TModule['params'] | undefined): Promise<T> {
    const factory = this as ModuleFactory<T>
    const schema = factory.creatableModule.configSchema
    const mergedParams: TModule['params'] = merge({}, factory.defaultParams, params, {
      config: merge({}, factory.defaultParams?.config, params?.config, { schema }),
    })
    return factory.creatableModule.create<T>(mergedParams)
  }

  factory<T extends ModuleInstance>(this: CreatableModule<T>, _params?: T['params'] | undefined): CreatableModuleFactory<T> {
    throw new Error('Method not implemented.')
  }
}
