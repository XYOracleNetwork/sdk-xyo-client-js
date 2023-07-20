import { assertEx } from '@xylabs/assert'

import { ObjectTypeCheck, ObjectTypeConfig } from './IsObjectFactory'

export const AsObjectFactory = {
  create: <TModule extends object>(typeCheck: ObjectTypeCheck<TModule>) => {
    function func(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module: any,
      config?: ObjectTypeConfig,
    ): TModule | undefined
    function func(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module: any,
      assert: string | (() => string),
      config?: ObjectTypeConfig,
    ): TModule
    function func(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module: any,
      assertOrConfig?: string | (() => string) | ObjectTypeConfig,
      config?: ObjectTypeConfig,
    ): TModule | undefined {
      const resolvedAssert = typeof assertOrConfig === 'object' ? undefined : assertOrConfig
      const resolvedConfig = typeof assertOrConfig === 'object' ? assertOrConfig : config
      const result = typeCheck(module, resolvedConfig) ? module : undefined

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const noUndefined = (resolvedAssert: any): resolvedAssert is TModule => {
        return !!resolvedAssert
      }

      if (noUndefined(resolvedAssert)) {
        return assertEx(result, typeof resolvedAssert === 'function' ? resolvedAssert() : resolvedAssert)
      } else {
        return result
      }
    }
    return func
  },
}
