import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address, isAddress } from '@xylabs/hex'
import { IdLogger, Logger } from '@xylabs/logger'
import { Schema } from '@xyo-network/payload-model'

import {
  AddressModuleFilter,
  asModuleInstance,
  isQueryModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleResolver,
  NameModuleFilter,
  QueryModuleFilter,
} from './instance'
import { duplicateModules } from './lib'
import { ModuleIdentifier } from './ModuleIdentifier'
import { ModuleIdentifierTransformer } from './ModuleIdentifierTransformer'

/*

Resolution rules

1. Resolution is always done from the perspective of the module whose resolve function was called.

2. Requesting '*' will return all the modules that the resolver can see. [limited by maxDepth]

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
      iii)  This means that when traversing upResolvers, you can traverse all the way up. [limited by maxDepth]
      iv)   At any point of the up traversal, it can start traversing down to any immediate child, public or private.
    b) Down Traversal
      i)    A down traversal is limited to the public children of the module. [The same as scope as calling the 'resolve' function]

9. An up or a down traversal counts against the maxDepth

*/

export interface ResolveHelperConfig {
  address: Address
  dead?: boolean
  downResolver?: ModuleResolver
  logger?: Logger
  module: ModuleInstance
  privateResolver?: ModuleResolver
  transformers: ModuleIdentifierTransformer[]
  upResolver?: ModuleResolver
}

export class ResolveHelper {
  static defaultLogger?: Logger
  static transformers: ModuleIdentifierTransformer[] = []
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
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const { logger = this.defaultLogger } = config

    logger?.debug('start', idOrFilter, options.maxDepth)
    if (idOrFilter === '*') {
      return this.resolveAll(config, options)
    } else {
      switch (typeof idOrFilter) {
        case 'string': {
          return await this.resolveId(config, idOrFilter, options)
        }
        default: {
          return await this.resolveFilter(config, idOrFilter, options)
        }
      }
    }
  }

  static async resolveAll<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    { maxDepth = 3, ...options }: ModuleFilterOptions<T> = {},
  ) {
    if (maxDepth === 0) {
      return []
    }

    const { childOptions, parentOptions, direction, down, exclude, oneLevelUpOptions, requiredLogger, up, oneLevelDownOptions, module } =
      this.parseConfig(config, {
        ...options,
        maxDepth,
      })
    const { logger = this.defaultLogger, dead = false, privateResolver, upResolver, downResolver } = config

    // if the module is dead, return an empty array
    if (dead) {
      logger?.warn('failed [dead]', '*')
      return []
    }

    const children = down ? await (downResolver as ModuleResolver).resolve<T>('*', oneLevelDownOptions) : []
    const parents = up ? await (upResolver as ModuleResolver).resolve<T>('*', oneLevelUpOptions) : []

    //if we are going up, we can check the siblings of the module
    const siblings = direction === 'up' ? (await (privateResolver as ModuleResolver | undefined)?.resolve<T>('*', oneLevelDownOptions)) ?? [] : []

    const levelOneDownModules = [...children, ...siblings].filter(duplicateModules).filter((module) => !exclude.includes(module.address))
    const levelOneUpModules = [...parents].filter(duplicateModules).filter((module) => !exclude.includes(module.address))
    const levelOneModules = [...levelOneDownModules, ...levelOneUpModules].filter(duplicateModules)

    //console.log('levelOneDownModules:', toJsonString(levelOneDownModules.map((module) => module.address)))
    //console.log('levelOneUpModules:', toJsonString(levelOneUpModules.map((module) => module.address)))
    //console.log('siblings:', toJsonString(siblings.map((module) => module.address)))

    if (levelOneModules.length === 0) {
      requiredLogger?.log('Failed to find required module: ', '*')
    }

    if (maxDepth === 1) {
      return levelOneModules
    }

    //for children, always exclude the module itself
    const levelTwoExclude = [...exclude, ...levelOneModules.map((module) => module.address), module.address]
    const levelTwoDownModules = (
      await Promise.all(levelOneDownModules.map(async (module) => await module.resolve<T>('*', { ...childOptions, exclude: levelTwoExclude })))
    )
      .flat()
      .filter(duplicateModules)
    const levelTwoUpModules = (
      await Promise.all(levelOneUpModules.map(async (module) => await module.resolve<T>('*', { ...parentOptions, exclude: levelTwoExclude })))
    )
      .flat()
      .filter(duplicateModules)
    const levelTwoModules = [...levelTwoDownModules, ...levelTwoUpModules]
    //console.log('levelTwoModules:', toJsonString(levelTwoModules.map((module) => module.address)))
    const allModules = [module as T, ...levelOneModules, ...levelTwoModules].filter(duplicateModules)
    //console.log('allModules:', toJsonString(allModules.map((module) => module.address)))
    return allModules
  }

  static async resolveFilter<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    filter: ModuleFilter<T>,
    options: ModuleFilterOptions<T> = {},
  ) {
    if (isQueryModuleFilter(filter)) {
      const isMatch = (module: ModuleInstance, querySet: Schema[]) => {
        for (const querySchema of querySet) {
          if (module.queries.includes(querySchema)) {
            continue
          }
          return false
        }
        return true
      }

      const { query } = filter as QueryModuleFilter
      const modules = await this.resolveAll(config, options)
      const result = modules.filter((module) => {
        for (const querySet of query) {
          if (isMatch(module, querySet)) {
            return true
          }
        }
        return false
      })
      return result
    } else {
      const ids = [...((filter as AddressModuleFilter).address ?? []), ...((filter as NameModuleFilter).name ?? [])]
      return (await Promise.all(ids.map(async (id) => await this.resolveId(config, id, options)))).filter(exists)
    }
  }

  static async resolveId<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    id: ModuleIdentifier,
    options: ModuleFilterOptions<T> = {},
  ) {
    const { oneLevelDownOptions, up, oneLevelUpOptions } = this.parseConfig(config, options)
    const { privateResolver, transformers, logger = this.defaultLogger, dead = false, upResolver, downResolver } = config

    if (dead) {
      logger?.warn('failed [dead]', '*')
      return
    }

    const finalId = await this.transformModuleIdentifier(id, transformers)

    if (isAddress(finalId)) {
      const modules = await this.resolveAll(config, options)
      return modules.find((module) => module.address === finalId)
    }

    const resolvers = [
      [downResolver, oneLevelDownOptions],
      [up ? upResolver : undefined, oneLevelUpOptions],
      [up ? privateResolver : undefined, oneLevelDownOptions],
    ].filter(([resolver]) => exists(resolver)) as [ModuleResolver, ModuleFilterOptions<T>][]

    let result: T | undefined

    for (const resolver of resolvers) {
      const [resolverInstance] = resolver
      if (!result) {
        result = await this.resolveModuleIdentifier<T>(resolverInstance, finalId)
      }
    }
    return result
  }

  //resolves a complex module path to addresses
  static async resolveModuleIdentifier<T extends ModuleInstance = ModuleInstance>(
    resolver: ModuleResolver,
    path: ModuleIdentifier,
    required?: boolean,
  ): Promise<T | undefined> {
    const parts = path.split(':')
    const first = parts.shift()
    const firstIsAddress = isAddress(first)
    const resolvedModule =
      (await resolver.resolve(first, { maxDepth: firstIsAddress ? 10 : 1 })) ??
      (first ? await resolver.resolvePrivate(first, { maxDepth: firstIsAddress ? 10 : 1 }) : undefined)
    const finalModule = required ? assertEx(resolvedModule, () => `Failed to resolve [${first}] [${firstIsAddress}]`) : resolvedModule
    const firstModule = asModuleInstance(finalModule, () => `Resolved invalid module instance [${first}]`) as T
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

  static async transformModuleIdentifier(
    identifier: ModuleIdentifier,
    transformers: ModuleIdentifierTransformer[] = ResolveHelper.transformers,
  ): Promise<ModuleIdentifier> {
    let id = identifier
    for (const transformer of transformers) {
      id = await transformer.transform(id)
    }
    return id
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

  private static parseConfig<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    { maxDepth = 3, required = 'log', exclude = [], ...options }: ModuleFilterOptions<T> = {},
  ) {
    const { module, logger = this.defaultLogger } = config
    const oneLevelOptions: ModuleFilterOptions<T> = { ...options, maxDepth: 1, required: false }
    const oneLevelDownOptions: ModuleFilterOptions<T> = { ...oneLevelOptions, direction: 'down', maxDepth: 1 }
    const oneLevelUpOptions: ModuleFilterOptions<T> = { ...oneLevelOptions, direction: 'up', maxDepth: 1 }

    const childOptions: ModuleFilterOptions<T> = { ...options, direction: 'down', maxDepth: maxDepth - 1, required: false }
    const parentOptions: ModuleFilterOptions<T> = { ...options, direction: 'up', maxDepth: maxDepth - 1, required: false }
    const requiredLogger =
      logger ?
        required === 'log' ?
          new IdLogger(logger, () => `ResolveHelper [${module.id}][*]`)
        : undefined
      : undefined

    const direction = options?.direction ?? 'all'
    const up = direction === 'up' || direction === 'all'
    const down = direction === 'down' || direction === 'all'
    return { childOptions, direction, down, exclude, module, oneLevelDownOptions, oneLevelUpOptions, parentOptions, requiredLogger, up }
  }
}
