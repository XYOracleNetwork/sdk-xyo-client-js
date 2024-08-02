import { ModuleIdentifier } from '@xyo-network/module-model'
import { NodeInstance } from '@xyo-network/node-model'

import { MemoryNode, MemoryNodeParams } from '../MemoryNode.ts'
import { attachToExistingNode } from './attachToExistingNode.ts'

export const attachToNewNode = async (source: NodeInstance, id: ModuleIdentifier, destinationParams?: MemoryNodeParams): Promise<NodeInstance> => {
  const destination = await MemoryNode.create(destinationParams)
  return await attachToExistingNode(source, id, destination)
}
