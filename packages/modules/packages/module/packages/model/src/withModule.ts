import { isModule, ModuleTypeCheck } from './isModule'
import { Module } from './Module'

export const WithModuleFactory = {
  create: <T extends Module = Module>(typeCheck: ModuleTypeCheck<T>) => {
    return <R extends void = void>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      closure: (module: any) => R,
    ): R | undefined => {
      return typeCheck(module) ? closure(module) : undefined
    }
  },
}

export const withModule = WithModuleFactory.create(isModule)
