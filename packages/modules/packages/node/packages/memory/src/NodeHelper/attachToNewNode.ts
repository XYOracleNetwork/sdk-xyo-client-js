import type { ModuleIdentifier } from '@xyo-network/module-model'
import type { NodeInstance } from '@xyo-network/node-model'

import type { MemoryNodeParams } from '../MemoryNode.ts'
import { MemoryNode } from '../MemoryNode.ts'
import { attachToExistingNode } from './attachToExistingNode.ts'

export const attachToNewNode = async (source: NodeInstance, id: ModuleIdentifier, destinationParams?: MemoryNodeParams): Promise<NodeInstance> => {
  const destination = await MemoryNode.create(destinationParams)
  return await attachToExistingNode(source, id, destination)
}
