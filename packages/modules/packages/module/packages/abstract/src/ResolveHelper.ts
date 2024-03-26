/* eslint-disable complexity */
import { Address } from '@xylabs/hex'
import { IdLogger, Logger } from '@xylabs/logger'
import { toJsonString } from '@xylabs/object'
import { duplicateModules, ModuleFilter, ModuleFilterOptions, ModuleIdentifier, ModuleInstance, ModuleResolver } from '@xyo-network/module-model'

export interface ResolveHelperConfig {
  address: Address
  dead?: boolean
  downResolver?: ModuleResolver
  logger?: Logger
  module: ModuleInstance
  upResolver?: ModuleResolver
}

export class ResolveHelper {
  static defaultLogger?: Logger
  static async resolve<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    all: '*',
    options?: ModuleFilterOptions<T>,
  ): Promise<T[]>
  static async resolve<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    filter: ModuleFilter,
    options?: ModuleFilterOptions<T>,
  ): Promise<T[]>
  static async resolve<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | undefined>
  static async resolve<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    { visibility, maxDepth = 5, required = 'log', ...options }: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const { module, logger = this.defaultLogger, dead = false, upResolver, downResolver } = config
    const log = logger ? new IdLogger(logger, () => `ResolveHelper [${module.id}][${idOrFilter}][${visibility}]`) : undefined
    const childOptions: ModuleFilterOptions<T> = { ...options, direction: 'down', maxDepth: maxDepth - 1, required: false, visibility }
    const direction = options?.direction ?? 'all'
    const up = direction === 'up' || direction === 'all'
    const down = direction === 'down' || direction === 'all'
    let result: T | T[] | undefined
    log?.debug('start', idOrFilter, maxDepth)
    if (idOrFilter === '*') {
      if (dead) {
        log?.warn('failed [dead]', idOrFilter)
        return []
      }
      const modules = [
        ...(down ? await (downResolver as ModuleResolver).resolve<T>('*', childOptions) : []),
        ...(up ? await (upResolver as ModuleResolver).resolve<T>('*', childOptions) : []),
      ]
        .filter(duplicateModules)
        .filter((module) => module.address !== config.address)

      if (modules.length > 0) {
        log?.log('modules [count]', modules.length)
        log?.debug('modules', toJsonString(modules, 4))
      }

      if (maxDepth === 0) {
        return modules
      }
      const childModules = (await Promise.all(modules.map(async (module) => await module.resolve<T>('*', childOptions))))
        .flat()
        .filter(duplicateModules)
      return [module as T, ...modules, ...childModules].filter(duplicateModules)
    } else {
      switch (typeof idOrFilter) {
        case 'string': {
          if (dead) {
            return undefined
          }
          result =
            (down ? await (downResolver as ModuleResolver).resolve<T>(idOrFilter, childOptions) : undefined) ??
            (up ? await (upResolver as ModuleResolver).resolve<T>(idOrFilter, childOptions) : undefined)
          break
        }
        default: {
          if (dead) {
            return []
          }
          const filter: ModuleFilter<T> | undefined = idOrFilter
          result = [
            ...(down ? await (downResolver as ModuleResolver).resolve<T>(filter, childOptions) : []),
            ...(up ? await (upResolver as ModuleResolver).resolve<T>(filter, childOptions) : []),
          ].filter(duplicateModules)
          break
        }
      }
    }
    this.validateRequiredResolve(required, result, idOrFilter, logger)
    return result
  }

  static validateRequiredResolve(
    required: boolean | 'warn' | 'log',
    result: ModuleInstance[] | ModuleInstance | undefined,
    idOrFilter: ModuleIdentifier | ModuleFilter,
    logger = this.defaultLogger,
  ) {
    const log = logger ? new IdLogger(logger, () => `validateRequiredResolve [${idOrFilter}][${result}]`) : undefined
    if (required && (result === undefined || (Array.isArray(result) && result.length > 0))) {
      switch (required) {
        case 'warn': {
          log?.warn('resolve failed', idOrFilter)
          break
        }
        case 'log': {
          log?.log('resolve failed', idOrFilter)
          break
        }
        default: {
          throw new Error(`resolve failed [${idOrFilter}]`)
        }
      }
    }
  }
}
