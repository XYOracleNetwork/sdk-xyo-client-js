import { AbstractNode, MemoryNode } from '@xyo-network/node'

import { configureTransports } from './configuration'

export const getNode = async (): Promise<AbstractNode> => {
  // TODO: Get ENV, AWS Secrets, config
  // nconf?
  const node = await MemoryNode.create()
  await configureTransports(node)
  return node
}
