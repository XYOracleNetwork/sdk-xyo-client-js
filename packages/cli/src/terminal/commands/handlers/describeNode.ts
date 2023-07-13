import { DirectNodeModule } from '@xyo-network/node'

import { printLine, printTitle } from '../../../lib'

export const describeNode = async (node: DirectNodeModule) => {
  printTitle('Describe Node')
  const description = (await node.describe()) ?? {}
  printLine(JSON.stringify(description, undefined, 2))
}
