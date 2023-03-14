import { NodeModule, NodeWrapper } from '@xyo-network/node'

import { printLine, printTitle } from '../../../lib'

export const describeNode = async (node: NodeModule) => {
  printTitle('Describe Node')
  const wrapper = NodeWrapper.wrap(node)
  const description = (await wrapper.describe()) ?? {}
  printLine(JSON.stringify(description, undefined, 2))
}
