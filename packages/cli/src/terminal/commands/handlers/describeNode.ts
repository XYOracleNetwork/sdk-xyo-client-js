import { NodeModule } from '@xyo-network/node'

import { printLine, printTitle } from '../../../lib'

export const describeNode = async (node: NodeModule) => {
  printTitle('Describe Node')
  const description = (await node.describe()) ?? {}
  printLine(JSON.stringify(description, undefined, 2))
}
