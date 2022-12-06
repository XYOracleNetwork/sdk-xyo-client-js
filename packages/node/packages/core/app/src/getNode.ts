import { AbstractNode, MemoryNode } from '@xyo-network/node'

import { configureEnvironment, configureTransports } from './configuration'

export const getNode = async (): Promise<AbstractNode> => {
  // TODO: Get ENV, AWS Secrets, config
  // nconf?
  const node = await MemoryNode.create()
  await configureEnvironment(node)
  await configureTransports(node)
  return node
}
