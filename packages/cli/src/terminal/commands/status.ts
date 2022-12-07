import { MemoryNode } from '@xyo-network/node'

import { printError, printTitle } from '../../lib'

export const status = (_node: MemoryNode) => {
  printTitle('Status')
  printError('TODO')
  return Promise.resolve()
}
