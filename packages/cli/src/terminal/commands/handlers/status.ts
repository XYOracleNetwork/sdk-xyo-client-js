import { NodeInstance } from '@xyo-network/node-model'

import { getProcessInfo, getSettingsInfo, isRunning, printLine, printTitle } from '../../../lib'

export const status = async (_node: NodeInstance) => {
  printTitle('Status')
  const running = await isRunning()
  if (running) {
    printLine('Node: Running')
  } else {
    printLine('Node: Not Running')
  }
  const node = await getProcessInfo()
  const wallet = await getSettingsInfo()
  const info = {
    node,
    wallet,
  }
  printLine(JSON.stringify(info, undefined, 2))
}
