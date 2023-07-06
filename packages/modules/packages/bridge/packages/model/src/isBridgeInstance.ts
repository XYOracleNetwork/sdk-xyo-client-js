import { IsInstanceFactory, isModuleInstance } from '@xyo-network/module-model'

import { BridgeInstance } from './Bridge'

export const isBridgeInstance = IsInstanceFactory.create<BridgeInstance>(
  {
    connect: 'function',
    disconnect: 'function',
  },
  isModuleInstance,
)
