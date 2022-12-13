import { MemoryNode } from '@xyo-network/node'

import { getCommand } from './getCommand'
import { stopTerminal } from './stopTerminal'

export const startTerminal = async (node: MemoryNode) => {
  let running = true
  while (running) {
    running = await getCommand(node)
  }
  stopTerminal()
}
