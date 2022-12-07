import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { newline } from '../../../lib'

export const attachModule = (_node: MemoryNode) => {
  newline()
  terminal.yellow('Attach Module')
  newline()
  terminal.red('TODO')
  newline()
  return Promise.resolve()
}
