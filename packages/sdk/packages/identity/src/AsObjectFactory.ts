import { assertEx } from '@xylabs/assert'

import { ObjectTypeCheck, ObjectTypeConfig } from './IsObjectFactory'

export const AsObjectFactory = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  create: <T extends {}>(typeCheck: ObjectTypeCheck<T>) => {
    function func(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: any,
      config?: ObjectTypeConfig,
    ): T | undefined
    function func(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: any,
      assert: string | (() => string),
      config?: ObjectTypeConfig,
    ): T
    function func(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: any,
      assertOrConfig?: string | (() => string) | ObjectTypeConfig,
      config?: ObjectTypeConfig,
    ): T | undefined {
      const resolvedAssert = typeof assertOrConfig === 'object' ? undefined : assertOrConfig
      const resolvedConfig = typeof assertOrConfig === 'object' ? assertOrConfig : config
      const result = typeCheck(obj, resolvedConfig) ? obj : undefined

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const noUndefined = (resolvedAssert: any): resolvedAssert is T => {
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
