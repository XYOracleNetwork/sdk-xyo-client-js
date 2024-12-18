import type { ModuleIdentifier } from '@xyo-network/module-model'
import { NodeConfigSchema, type NodeInstance } from '@xyo-network/node-model'

import type { MemoryNodeParams } from '../MemoryNode.ts'
import { MemoryNode } from '../MemoryNode.ts'
import { attachToExistingNode } from './attachToExistingNode.ts'

const DEFAULT_NODE_PARAMS = { config: { schema: NodeConfigSchema } }

export const attachToNewNode = async (
  source: NodeInstance,
  id: ModuleIdentifier,
  destinationParams: MemoryNodeParams = DEFAULT_NODE_PARAMS,
): Promise<NodeInstance> => {
  const destination = await MemoryNode.create(destinationParams)
  return await attachToExistingNode(source, id, destination)
}
