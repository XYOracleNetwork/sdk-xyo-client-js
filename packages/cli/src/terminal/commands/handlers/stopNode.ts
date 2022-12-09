import { MemoryNode } from '@xyo-network/node'

import { printTitle, stop } from '../../../lib'

export const stopNode = async (_node: MemoryNode) => {
  printTitle('Stop Node')
  await stop()
}
