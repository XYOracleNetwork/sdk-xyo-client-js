import { ModuleIdentifier } from '@xyo-network/module-model'
import { NodeInstance } from '@xyo-network/node-model'

import { MemoryNode, MemoryNodeParams } from '../MemoryNode.js'
import { attachToExistingNode } from './attachToExistingNode.js'

export const attachToNewNode = async (source: NodeInstance, id: ModuleIdentifier, destinationParams?: MemoryNodeParams): Promise<NodeInstance> => {
  const destination = await MemoryNode.create(destinationParams)
  return await attachToExistingNode(source, id, destination)
}
