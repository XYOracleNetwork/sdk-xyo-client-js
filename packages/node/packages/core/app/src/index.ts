import { AbstractNode, MemoryNode } from '@xyo-network/node'

export const getNode = async (): Promise<AbstractNode> => {
  return await MemoryNode.create()
}
