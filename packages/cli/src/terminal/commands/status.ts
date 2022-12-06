import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

export const status = (_node: MemoryNode) => {
  terminal.yellow('\nStatus\n')
  terminal.red('\nTODO\n')
  return Promise.resolve()
}
