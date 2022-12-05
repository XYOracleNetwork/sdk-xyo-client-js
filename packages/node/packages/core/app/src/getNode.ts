import { AbstractNode, MemoryNode } from '@xyo-network/node'

import { addTransports } from './registration'

export const getNode = async (): Promise<AbstractNode> => {
  const node = await MemoryNode.create()
  await addTransports(node)
  return node
}
