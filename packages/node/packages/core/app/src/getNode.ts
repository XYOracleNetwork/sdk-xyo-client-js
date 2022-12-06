import { MemoryNode } from '@xyo-network/node'

import { configureEnvironment, configureTransports } from './configuration'

export const getNode = async (): Promise<MemoryNode> => {
  const node = await MemoryNode.create()
  await configureEnvironment(node)
  await configureTransports(node)
  return node
}
