import { MemoryNode } from '@xyo-network/node'

import { getProcessInfo, getSettingsInfo, isRunning, printLine, printTitle } from '../../../lib'

export const status = async (_node: MemoryNode) => {
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
