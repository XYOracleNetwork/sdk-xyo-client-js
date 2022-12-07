import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { newline } from '../../lib'

export const describeNode = async (node: MemoryNode) => {
  newline()
  terminal.yellow('Describe Node')
  newline()
  const description = (await node.description()) ?? {}
  terminal(JSON.stringify(description, undefined, 2))
  newline()
}
