import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

export const describeNode = async (node: MemoryNode) => {
  terminal.yellow('\nDescribe Node\n')
  const description = (await node.description()) ?? {}
  terminal(JSON.stringify(description, undefined, 2))
}
