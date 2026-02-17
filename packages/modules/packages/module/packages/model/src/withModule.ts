import type { TypeCheck } from '@xylabs/sdk-js'

/** @deprecated use narrowing instead [ if(is) ] */
export const WithFactory = {
  create: <T extends object>(typeCheck: TypeCheck<T>) => {
    return <R>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mod: any,

      closure: (mod: T) => R,
    ): R | undefined => {
      return typeCheck(mod) ? closure(mod) : undefined
    }
  },
}
