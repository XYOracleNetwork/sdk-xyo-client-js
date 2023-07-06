import { InstanceTypeCheck, isModule, isModuleInstance } from './isModule'

export const WithFactory = {
  create: <T extends object>(typeCheck: InstanceTypeCheck<T>) => {
    return <R extends void = void>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      closure: (module: T) => R,
    ): R | undefined => {
      return typeCheck(module) ? closure(module) : undefined
    }
  },
}

export const withModule = WithFactory.create(isModule)
export const withModuleInstance = WithFactory.create(isModuleInstance)
