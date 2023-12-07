import { AsTypeFactory, TypeCheck } from './AsTypeFactory'
import { EmptyObject } from './EmptyObject'

export const AsObjectFactory = {
  create: <T extends EmptyObject>(typeCheck: TypeCheck<T>) => {
    return AsTypeFactory.create<T>(typeCheck)
  },
}
