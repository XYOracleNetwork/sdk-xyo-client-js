import { assertEx } from '@xylabs/assert'

import { InstanceTypeCheck, isModule, isModuleInstance } from './isModule'

export const AsFactory = {
  create: <TModule extends object>(typeCheck: InstanceTypeCheck<TModule>) => {
    function func(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module: any,
    ): TModule | undefined
    function func(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module: any,
      assert: string | (() => string),
    ): TModule
    function func(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module: any,
      assert?: string | (() => string),
    ): TModule | undefined {
      const result = typeCheck(module) ? module : undefined

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const noUndefined = (assert: any): assert is TModule => {
        return !!assert
      }

      if (noUndefined(assert)) {
        return assertEx(result, typeof assert === 'function' ? assert() : assert)
      } else {
        return result
      }
    }
    return func
  },
}

export const asModule = AsFactory.create(isModule)
export const asModuleInstance = AsFactory.create(isModuleInstance)
