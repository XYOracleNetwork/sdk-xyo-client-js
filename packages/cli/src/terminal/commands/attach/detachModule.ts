import { MemoryNode } from '@xyo-network/node'
import { terminal } from 'terminal-kit'

import { newline } from '../../../lib'

export const detachModule = (_node: MemoryNode) => {
  newline()
  terminal.yellow('Detach Module')
  newline()
  terminal.red('TODO')
  newline()
  return Promise.resolve()
}
