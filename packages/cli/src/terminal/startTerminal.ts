import { NodeInstance } from '@xyo-network/node-model'

import { getCommand } from './getCommand'
import { stopTerminal } from './stopTerminal'

export const startTerminal = async (node: NodeInstance) => {
  let running = true
  while (running) {
    running = await getCommand(node)
  }
  stopTerminal()
}
