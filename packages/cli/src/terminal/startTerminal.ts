import { NodeModule } from '@xyo-network/node'

import { getCommand } from './getCommand'
import { stopTerminal } from './stopTerminal'

export const startTerminal = async (node: NodeModule) => {
  let running = true
  while (running) {
    running = await getCommand(node)
  }
  stopTerminal()
}
