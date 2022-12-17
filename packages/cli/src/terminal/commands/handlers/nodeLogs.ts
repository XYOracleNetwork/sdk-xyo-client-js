import { MemoryNode } from '@xyo-network/node'

import { printOutFile, printTitle } from '../../../lib'

export const nodeLogs = async (_node: MemoryNode) => {
  printTitle('Node Logs')
  await printOutFile()
}
