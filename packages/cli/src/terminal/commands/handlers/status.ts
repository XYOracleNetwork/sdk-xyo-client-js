import { MemoryNode } from '@xyo-network/node'

import { getProcessInfo, isRunning, printLine, printTitle } from '../../../lib'

export const status = async (_node: MemoryNode) => {
  printTitle('Status')
  const running = await isRunning()
  if (running) {
    printLine('Node Running')
  } else {
    printLine('Node Not Running')
  }
  printLine(JSON.stringify(await getProcessInfo(), undefined, 2))
}
