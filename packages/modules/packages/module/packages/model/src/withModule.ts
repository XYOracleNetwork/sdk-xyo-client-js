import { TypeCheck } from '@xylabs/object'

import { isModuleInstance } from './instance/index.ts'
import { isModule } from './module/index.ts'

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

export const withModule = WithFactory.create(isModule)
export const withModuleInstance = WithFactory.create(isModuleInstance)
