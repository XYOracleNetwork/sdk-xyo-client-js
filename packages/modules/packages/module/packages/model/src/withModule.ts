import { TypeCheck } from '@xylabs/object'

import { isModuleInstance } from './instance'
import { isModule } from './module'

export const WithFactory = {
  create: <T extends object>(typeCheck: TypeCheck<T>) => {
    return <R>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module: any,

      closure: (module: T) => R,
    ): R | undefined => {
      return typeCheck(module) ? closure(module) : undefined
    }
  },
}

export const withModule = WithFactory.create(isModule)
export const withModuleInstance = WithFactory.create(isModuleInstance)
