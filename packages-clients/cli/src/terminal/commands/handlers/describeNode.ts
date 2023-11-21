import { NodeInstance } from '@xyo-network/node-model'

import { printLine, printTitle } from '../../../lib'

export const describeNode = async (node: NodeInstance) => {
  printTitle('Describe Node')
  const description = (await node.describe()) ?? {}
  printLine(JSON.stringify(description, undefined, 2))
}
