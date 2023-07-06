import { IsInstanceFactory, isModuleInstance } from '@xyo-network/module-model'

import { DivinerInstance } from './Diviner'

export const isDivinerInstance = IsInstanceFactory.create<DivinerInstance>(
  {
    divine: 'function',
  },
  isModuleInstance,
)
