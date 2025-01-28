/* eslint-disable max-statements */
/* eslint-disable complexity */
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { Address } from '@xylabs/hex'
import { isAddress } from '@xylabs/hex'
import type { Logger } from '@xylabs/logger'
import { IdLogger } from '@xylabs/logger'
import { toJsonString } from '@xylabs/object'

import type {
  ModuleFilterOptions, ModuleInstance, ModuleResolver,
} from '../instance/index.ts'
import { asModuleInstance } from '../instance/index.ts'
import { duplicateModules } from '../lib/index.ts'
import type { ModuleIdentifier } from '../ModuleIdentifier.ts'
import type { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer.ts'
import { ResolveHelperStatic } from './ResolveHelperStatic.ts'
import { resolvePathToAddress } from './resolvePathToAddress.ts'
import { traceModuleIdentifier } from './traceModuleIdentifier.ts'
import { transformModuleIdentifier } from './transformModuleIdentifier.ts'

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
  mod: ModuleInstance
  privateResolver?: ModuleResolver
  transformers: ModuleIdentifierTransformer[]
  upResolver?: ModuleResolver
}

export class ResolveHelper extends ResolveHelperStatic {
  static async resolve<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    all: '*',
    options?: ModuleFilterOptions<T>,
  ): Promise<T[]>
  static async resolve<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | undefined>
  static async resolve<T extends ModuleInstance = ModuleInstance>(
    config: ResolveHelperConfig,
    id: ModuleIdentifier = '*',
    {
 maxDepth = 3, required = 'log', ...options
}: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const {
      transformers, mod, logger = this.defaultLogger, dead = false, upResolver, downResolver, privateResolver,
    } = config
    const log = logger ? new IdLogger(logger, () => `ResolveHelper [${mod.id}][${id}]`) : undefined

    const downLocalOptions: ModuleFilterOptions<T> = {
      ...options, direction: 'down', maxDepth, required: false,
    }
    const upLocalOptions: ModuleFilterOptions<T> = { ...downLocalOptions, direction: 'up' }

    const childOptions: ModuleFilterOptions<T> = {
      ...options, maxDepth: maxDepth - 1, required: false,
    }

    const direction = options?.direction ?? 'all'
    const up = direction === 'up' || direction === 'all'
    const down = direction === 'down' || direction === 'all'
    let result: T | T[] | undefined
    log?.debug('start', id, maxDepth)
    if (id === '*') {
      if (dead) {
        log?.warn('failed [dead]', id)
        return []
      }
      const modules = [
        ...(down ? await (downResolver as ModuleResolver).resolve<T>('*', downLocalOptions) : []),
        ...(up ? await (upResolver as ModuleResolver).resolve<T>('*', upLocalOptions) : []),
      ].filter(duplicateModules)

      if (modules.length > 0) {
        log?.log('modules [count]', modules.length)
        log?.debug('modules', toJsonString(modules, 4))
      }

      if (maxDepth === 0) {
        return modules
      }
      const childModules = (await Promise.all(modules.map(async mod => await mod.resolve<T>('*', childOptions)))).flat().filter(duplicateModules)
      return [...modules, ...childModules, mod as T].filter(duplicateModules)
    } else {
      switch (typeof id) {
        case 'string': {
          if (dead) {
            return undefined
          }

          const resolvedId = (await resolvePathToAddress(mod, id, false, transformers)) ?? id

          if (resolvedId) {
            const resolvers = [
              [downResolver, downLocalOptions],
              [up ? upResolver : undefined, upLocalOptions],
              [up ? privateResolver : undefined, upLocalOptions],
            ].filter(([resolver]) => exists(resolver)) as [ModuleResolver, ModuleFilterOptions<T>][]

            for (const resolver of resolvers) {
              const [resolverInstance] = resolver
              if (!result) {
                result = await this.resolveModuleIdentifier<T>(resolverInstance, resolvedId)
              }
            }
          }

          break
        }
        default: {
          break
        }
      }
    }
    this.validateRequiredResolve(required, result, id, logger)
    return result
  }

  // resolves a complex module path to addresses
  static async resolveModuleIdentifier<T extends ModuleInstance = ModuleInstance>(
    resolver: ModuleResolver,
    path: ModuleIdentifier,
    required?: boolean,
  ): Promise<T | undefined> {
    const parts = path.split(':')
    const first = parts.shift()
    const firstIsAddress = isAddress(first)
    const resolvedModule
      = (await resolver.resolve(first, { maxDepth: firstIsAddress ? 10 : 1 }))
        ?? (first ? await resolver.resolvePrivate(first, { maxDepth: firstIsAddress ? 10 : 1 }) : undefined)
    const finalModule = required ? assertEx(resolvedModule, () => `Failed to resolve [${first}] [${firstIsAddress}]`) : resolvedModule
    const firstModule = asModuleInstance(finalModule, () => `Resolved invalid module instance [${first}]`) as T
    if (firstModule) {
      return parts.length > 0 ? await this.resolveModuleIdentifier<T>(firstModule, parts.join(':')) : firstModule
    }
  }

  // translates a complex module path to addresses
  static traceModuleIdentifier(resolver: ModuleResolver, path: ModuleIdentifier) {
    return traceModuleIdentifier(resolver, path)
  }

  static transformModuleIdentifier(identifier: ModuleIdentifier, transformers: ModuleIdentifierTransformer[] = ResolveHelper.transformers) {
    return transformModuleIdentifier(identifier, transformers)
  }

  static validateRequiredResolve(
    required: boolean | 'warn' | 'log',
    result: ModuleInstance[] | ModuleInstance | undefined,
    id: ModuleIdentifier,
    logger = this.defaultLogger,
  ) {
    const log = logger ? new IdLogger(logger, () => `validateRequiredResolve [${id}][${result}]`) : undefined
    if (required && (result === undefined || (Array.isArray(result) && result.length > 0))) {
      switch (required) {
        case 'warn': {
          log?.warn('resolve failed', id)
          break
        }
        case 'log': {
          log?.log('resolve failed', id)
          break
        }
        default: {
          throw new Error(`resolve failed [${id}]`)
        }
      }
    }
  }
}
