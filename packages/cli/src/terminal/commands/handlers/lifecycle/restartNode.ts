import { MemoryNode } from '@xyo-network/node'

import { printTitle, restart } from '../../../../lib'

export const stopNode = async (_node: MemoryNode) => {
  printTitle('Restart Node')
  await restart()
}
