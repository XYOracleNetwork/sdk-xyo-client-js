import { NodeInstance } from '@xyo-network/node'

import { printOutFile, printTitle } from '../../../lib'

export const nodeLogs = async (_node: NodeInstance) => {
  printTitle('Node Logs')
  await printOutFile()
}
