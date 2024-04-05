import { ModuleIdentifier } from '@xyo-network/module-model'
import { NodeInstance } from '@xyo-network/node-model'

import { MemoryNode, MemoryNodeParams } from '../MemoryNode'
import { flatAttachToExistingNode } from './flatAttachToExistingNode'

export const flatAttachToNewNode = async (
  source: NodeInstance,
  id: ModuleIdentifier,
  destinationParams?: MemoryNodeParams,
): Promise<NodeInstance> => {
  const destination = await MemoryNode.create(destinationParams)
  return await flatAttachToExistingNode(source, id, destination)
}
