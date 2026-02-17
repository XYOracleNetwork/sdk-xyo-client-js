import type {
  AnyNonPromise,
  AnyObject, EmptyObject, TypeCheck,
  TypeCheckConfig,
} from '@xylabs/sdk-js'

import { asQueryableModuleObject } from './asQueryableModuleObject.ts'
import { isQueryableModuleObject } from './isQueryableModuleObject.ts'
import type { QueryableModule } from './QueryableModule.ts'

export type QueryableModuleTypeCheck<T extends QueryableModule = QueryableModule> = TypeCheck<T>

/** @deprecated use QueryableModuleTypeCheck instead */
export type ModuleTypeCheck<T extends QueryableModule = QueryableModule> = TypeCheck<T>

export class IsQueryableModuleFactory<T extends QueryableModule = QueryableModule> {
  create(expectedQueries?: string[], additionalChecks?: TypeCheck<AnyObject | EmptyObject>[]): QueryableModuleTypeCheck<T> {
    const result = (obj: AnyNonPromise, config?: TypeCheckConfig | number): obj is T => {
      const mod = asQueryableModuleObject(obj)
      return (
        isQueryableModuleObject(mod, config)
        // eslint-disable-next-line unicorn/no-array-reduce
        && (expectedQueries?.reduce((prev, query) => prev && mod.queries.includes(query), true) ?? true)
        // perform additional checks
        // eslint-disable-next-line unicorn/no-array-reduce
        && (additionalChecks?.reduce((prev, check) => prev && check(obj, config), true) ?? true)
      )
    }
    return result
  }
}

/** @deprecated use IsQueryableModuleFactory instead */
export class IsModuleFactory<T extends QueryableModule = QueryableModule> extends IsQueryableModuleFactory<T> {}
