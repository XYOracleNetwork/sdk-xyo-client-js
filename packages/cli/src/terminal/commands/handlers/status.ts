import { MemoryNode } from '@xyo-network/node'

import { getAccountInfo, getProcessInfo, isRunning, printLine, printTitle } from '../../../lib'

export const status = async (_node: MemoryNode) => {
  printTitle('Status')
  const running = await isRunning()
  if (running) {
    printLine('Node Running')
  } else {
    printLine('Node Not Running')
  }
  const node = await getProcessInfo()
  const account = await getAccountInfo()
  const info = {
    account,
    node,
  }
  printLine(JSON.stringify(info, undefined, 2))
}
