import { MemoryNode } from '@xyo-network/node'

import { printLine, printTitle } from '../../lib'

export const describeNode = async (node: MemoryNode) => {
  printTitle('Describe Node')
  const description = (await node.description()) ?? {}
  printLine(JSON.stringify(description, undefined, 2))
}
