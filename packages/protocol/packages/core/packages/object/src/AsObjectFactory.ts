import { assertEx } from '@xylabs/assert'

import { ObjectTypeCheck, ObjectTypeConfig } from './IsObjectFactory'

export const AsObjectFactory = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  create: <T extends object>(typeCheck: ObjectTypeCheck<T>) => {
    function func<TObject extends T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: TObject,
      config?: ObjectTypeConfig,
    ): TObject | undefined
    function func<TObject extends T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: TObject,
      assert: string | (() => string),
      config?: ObjectTypeConfig,
    ): TObject
    function func<TObject extends T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: TObject,
      assertOrConfig?: string | (() => string) | ObjectTypeConfig,
      config?: ObjectTypeConfig,
    ): TObject | undefined {
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
