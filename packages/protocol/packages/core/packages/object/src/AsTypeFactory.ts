import { assertEx } from '@xylabs/assert'
import { Logger } from '@xylabs/logger'

export interface TypeCheckConfig {
  log?: boolean | Logger
}

export type TypeCheck<T> = (obj: unknown, config?: TypeCheckConfig) => obj is T

export const AsTypeFactory = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  create: <T>(typeCheck: TypeCheck<T>) => {
    function func<TType extends T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: unknown,
      config?: TypeCheckConfig,
    ): TType | undefined
    function func<TType extends T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: unknown,
      assert: string | (() => string),
      config?: TypeCheckConfig,
    ): TType
    function func<TType extends T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: unknown,
      assertOrConfig?: string | (() => string) | TypeCheckConfig,
      config?: TypeCheckConfig,
    ): TType | undefined {
      const noUndefined = (resolvedAssert: unknown): resolvedAssert is T => {
        return resolvedAssert !== undefined
      }

      if (value === undefined) {
        return undefined
      }

      if (value === null) {
        return undefined
      }

      const resolvedAssert = typeof assertOrConfig === 'object' ? undefined : assertOrConfig
      const resolvedConfig = typeof assertOrConfig === 'object' ? assertOrConfig : config
      const result = typeCheck(value, resolvedConfig) ? value : undefined

      return noUndefined(resolvedAssert)
        ? (assertEx(result, typeof resolvedAssert === 'function' ? resolvedAssert() : resolvedAssert) as TType)
        : (result as TType)
    }
    return func
  },
}
