import { DirectNodeModule } from '@xyo-network/node'

import { printOutFile, printTitle } from '../../../lib'

export const nodeLogs = async (_node: DirectNodeModule) => {
  printTitle('Node Logs')
  await printOutFile()
}
