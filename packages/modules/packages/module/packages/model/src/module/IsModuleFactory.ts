import { AnyObject, EmptyObject, TypeCheck } from '@xylabs/object'
import { AnyNonPromise } from '@xylabs/promise'

import { asModuleObject } from './asModuleObject.js'
import { isModuleObject } from './isModuleObject.js'
import { Module } from './Module.js'

export type ModuleTypeCheck<T extends Module = Module> = TypeCheck<T>

export class IsModuleFactory<T extends Module = Module> {
  create(expectedQueries?: string[], additionalChecks?: TypeCheck<AnyObject | EmptyObject>[]): ModuleTypeCheck<T> {
    return (obj: AnyNonPromise, config): obj is T => {
      const mod = asModuleObject(obj)
      const result =
        isModuleObject(mod, config) &&
        (expectedQueries?.reduce((prev, query) => prev && mod.queries.includes(query), true) ?? true) &&
        //perform additional checks
        (additionalChecks?.reduce((prev, check) => prev && check(obj, config), true) ?? true)
      return result
    }
  }
}
