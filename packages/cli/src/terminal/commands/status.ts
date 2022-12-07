import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { newline } from '../../lib'

export const status = (_node: MemoryNode) => {
  newline()
  terminal.yellow('Status')
  newline()
  terminal.red('TODO')
  newline()
  return Promise.resolve()
}
