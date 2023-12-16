/* eslint-disable import/no-deprecated */
import { assertEx } from '@xylabs/assert'

import { ObjectTypeCheck, ObjectTypeConfig } from './IsObjectFactory'

/** @deprecated use from @xyo-network/object instead */
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

      return noUndefined(resolvedAssert) ? assertEx(result, typeof resolvedAssert === 'function' ? resolvedAssert() : resolvedAssert) : result
    }
    return func
  },
}
