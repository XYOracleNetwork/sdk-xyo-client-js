/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectTypeCheck } from '@xyo-network/object'

import { asModuleObject } from './asModuleObject'
import { isModuleObject } from './isModuleObject'
import { Module } from './Module'

export type ModuleTypeCheck<T extends Module = Module> = ObjectTypeCheck<T>

export class IsModuleFactory<T extends Module = Module> {
  create(expectedQueries?: string[], additionalChecks?: ObjectTypeCheck[]): ModuleTypeCheck<T> {
    return (obj: any, config): obj is T => {
      const module = asModuleObject(obj)
      const result =
        isModuleObject(module, config) &&
        (expectedQueries?.reduce((prev, query) => prev && obj.queries.includes(query), true) ?? true) &&
        //perform additional checks
        (additionalChecks?.reduce((prev, check) => prev && check(obj, config), true) ?? true)
      return result
    }
  }
}
