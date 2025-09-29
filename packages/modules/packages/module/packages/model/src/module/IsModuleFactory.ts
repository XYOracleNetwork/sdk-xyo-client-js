import type {
  AnyObject, EmptyObject, TypeCheck,
  TypeCheckConfig,
} from '@xylabs/object'
import type { AnyNonPromise } from '@xylabs/promise'

import { asModuleObject } from './asModuleObject.ts'
import { isModuleObject } from './isModuleObject.ts'
import type { Module } from './Module.ts'

export type ModuleTypeCheck<T extends Module = Module> = TypeCheck<T>

export class IsModuleFactory<T extends Module = Module> {
  create(expectedQueries?: string[], additionalChecks?: TypeCheck<AnyObject | EmptyObject>[]): ModuleTypeCheck<T> {
    const result = (obj: AnyNonPromise, config?: TypeCheckConfig | number): obj is T => {
      const mod = asModuleObject(obj)
      return (
        isModuleObject(mod, config)
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
