import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { newline } from '../../../lib'

export const unregisterModule = (_node: MemoryNode) => {
  newline()
  terminal.yellow('Unregister Module')
  newline()
  terminal.red('TODO')
  newline()
  return Promise.resolve()
}
