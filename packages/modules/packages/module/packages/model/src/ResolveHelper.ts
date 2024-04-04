/* eslint-disable max-statements */
/* eslint-disable complexity */
import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { IdLogger, Logger } from '@xylabs/logger'
import { toJsonString } from '@xylabs/object'

import { asModuleInstance, ModuleFilter, ModuleFilterOptions, ModuleInstance, ModuleResolver } from './instance'
import { duplicateModules } from './lib'
import { ModuleIdentifier } from './ModuleIdentifier'

/*

Resolution rules

1. Resolution is always done from the perspective of the module whose resolve function was called.

2. Requesting '*' will return all the modules that the resolver can see.

3. Requesting a simple ModuleName (string w/o ':' separator) will return an immediate child that has that name.

4. Requesting a complex ModuleName (string w/ ':' separator) will resolve the first part and then recursively resolve
   the remaining name by calling the first part's resolved module's resolve with the remainder of the name.

5. Requesting an Address (string) will return the module with that address, regardless of how distant it is from the module. [limited by maxDepth]

6. Requesting a ModuleFilter will first request all the modules '*' and then filter them based on the filter settings. [Do we need this mode?]

7. When a string is passed as the ModuleIdentifier, do the following:
    Check if id is complex (contains a ':')
      a)  If it is complex, go to #4 above
      b)  Call isAddress in the id to see if it is a valid address.
        i)  If it is a valid address, go to #5 above
        ii) If it is not a valid address, go to # 3 above

    Note 1: If someone were to name a module with a valid address, that name will not be resolvable.
    Note 2: If someone were to name a module with a string containing a ':', that name will not be resolvable.

8. Modules have two resolvers, up and down.
    a) Up Traversal
      i)    Every module's upResolver also can call it's parent's upResolver
      ii)   An upResolver also can see the parent's children's downResolvers
      iii)  This means that when traversing upResolvers, you can traverse all the way up.
      iv)   At any point of the up traversal, it can start traversing down to any immediate child, public or private.
    b) Down Traversal
      i)    A down traversal is limited to the public children of the module. [The same as scope as calling the 'resolve' function]

*/

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
    { visibility, maxDepth = 3, required = 'log', ...options }: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const { module, logger = this.defaultLogger, dead = false, upResolver, downResolver } = config
    const log = logger ? new IdLogger(logger, () => `ResolveHelper [${module.id}][${idOrFilter}][${visibility}]`) : undefined

    const downLocalOptions: ModuleFilterOptions<T> = { ...options, direction: 'down', maxDepth, required: false, visibility }
    const upLocalOptions: ModuleFilterOptions<T> = { ...downLocalOptions, direction: 'up' }

    const childOptions: ModuleFilterOptions<T> = { ...options, maxDepth: maxDepth - 1, required: false, visibility }

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
        ...(down ? await (downResolver as ModuleResolver).resolve<T>('*', downLocalOptions) : []),
        ...(up ? await (upResolver as ModuleResolver).resolve<T>('*', upLocalOptions) : []),
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
      return [...modules, ...childModules].filter(duplicateModules)
    } else {
      switch (typeof idOrFilter) {
        case 'string': {
          if (dead) {
            return undefined
          }
          result =
            (down && downResolver ? await this.resolveModuleIdentifier<T>(downResolver, idOrFilter) : undefined) ??
            (up && upResolver ? await this.resolveModuleIdentifier<T>(upResolver, idOrFilter) : undefined)
          break
        }
        default: {
          if (dead) {
            return []
          }
          const filter: ModuleFilter<T> | undefined = idOrFilter
          result = [
            ...(down ? await (downResolver as ModuleResolver).resolve<T>(filter, downLocalOptions) : []),
            ...(up ? await (upResolver as ModuleResolver).resolve<T>(filter, upLocalOptions) : []),
          ].filter(duplicateModules)
          break
        }
      }
    }
    this.validateRequiredResolve(required, result, idOrFilter, logger)
    return result
  }

  //resolves a complex module path to addresses
  static async resolveModuleIdentifier<T extends ModuleInstance = ModuleInstance>(
    resolver: ModuleResolver,
    path: ModuleIdentifier,
  ): Promise<T | undefined> {
    const parts = path.split(':')
    const first = parts.shift()
    const firstModule = asModuleInstance(
      assertEx(await resolver.resolve(first, { maxDepth: 1 }), () => `Failed to resolve [${first}]`),
      () => `Resolved invalid module instance [${first}]`,
    ) as T
    if (firstModule) {
      return parts.length > 0 ? await this.resolveModuleIdentifier<T>(firstModule, parts.join(':')) : firstModule
    }
  }

  //translates a complex module path to addresses
  static async traceModuleIdentifier(resolver: ModuleResolver, path: ModuleIdentifier): Promise<Address[]> {
    const parts = path.split(':')
    const first = parts.shift()
    const firstModule = asModuleInstance(
      assertEx(await resolver.resolve(first, { maxDepth: 1 }), () => `Failed to resolve [${first}]`),
      () => `Resolved invalid module instance [${first}]`,
    )
    if (firstModule) {
      return parts.length > 0 ? [firstModule.address, ...(await this.traceModuleIdentifier(firstModule, parts.join(':')))] : [firstModule.address]
    }
    return []
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
