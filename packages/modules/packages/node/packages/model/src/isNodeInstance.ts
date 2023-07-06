import { IsInstanceFactory } from '@xyo-network/module'

import { NodeInstance } from './Node'

export const isNodeInstance = IsInstanceFactory.create<NodeInstance>({
  attach: 'function',
  attached: 'function',
  detach: 'function',
  registered: 'function',
})
