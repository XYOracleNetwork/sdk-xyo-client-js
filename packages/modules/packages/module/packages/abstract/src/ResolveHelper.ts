import { Logger } from '@xylabs/logger'
import { duplicateModules, ModuleFilter, ModuleFilterOptions, ModuleIdentifier, ModuleInstance, ModuleResolver } from '@xyo-network/module-model'

export interface ResolveHelperConfig {
  dead?: boolean
  downResolver?: ModuleResolver
  upResolver?: ModuleResolver
}

export class ResolveHelper {
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
    { required = 'log', ...options }: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const { dead = false, upResolver, downResolver } = config
    const childOptions = { ...options, required: false }
    const direction = options?.direction ?? 'all'
    const up = direction === 'up' || direction === 'all'
    const down = direction === 'down' || direction === 'all'
    let result: T | T[] | undefined
    if (idOrFilter === '*') {
      if (dead) {
        return []
      }
      return [
        ...(down ? await (downResolver as ModuleResolver).resolve<T>('*', childOptions) : []),
        ...(up ? await (upResolver as ModuleResolver).resolve<T>('*', childOptions) : []),
      ].filter(duplicateModules)
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
    this.validateRequiredResolve(required, result, idOrFilter)
    return result
  }

  static validateRequiredResolve(
    required: boolean | 'warn' | 'log',
    result: ModuleInstance[] | ModuleInstance | undefined,
    idOrFilter: ModuleIdentifier | ModuleFilter,
    logger?: Logger,
  ) {
    if (required && (result === undefined || (Array.isArray(result) && result.length > 0))) {
      switch (required) {
        case 'warn': {
          logger?.warn('resolve failed', idOrFilter)
          break
        }
        case 'log': {
          logger?.log('resolve failed', idOrFilter)
          break
        }
        default: {
          logger?.error('resolve failed', idOrFilter)
          break
        }
      }
    }
  }
}
