import { NodeModule } from '@xyo-network/node'

import { printOutFile, printTitle } from '../../../lib'

export const nodeLogs = async (_node: NodeModule) => {
  printTitle('Node Logs')
  await printOutFile()
}
