import { AbstractNode, MemoryNode } from '@xyo-network/node'

import { registerTransports } from './registration'

export const getNode = async (): Promise<AbstractNode> => {
  // TODO: Get ENV, AWS Secrets, config
  // nconf?
  const node = await MemoryNode.create()
  await registerTransports(node)
  return node
}
