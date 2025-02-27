import { assertEx } from '@xylabs/assert'
import { ModuleIdentifier } from '@xyo-network/module-model'
import { asNodeInstance, NodeInstance } from '@xyo-network/node-model'

import { MemoryNode } from '../MemoryNode.ts'
import { flatAttachToExistingNode } from './flatAttachToExistingNode.ts'

export const attachToExistingNode = async (source: NodeInstance, id: ModuleIdentifier, destination: NodeInstance): Promise<NodeInstance> => {
  const parts = id.split(':')
  const first = assertEx(parts.shift(), () => 'missing first part')
  if (parts.length === 0) {
    // this is an immediate child/children
    return await flatAttachToExistingNode(source, first, destination)
  } else {
    // all parts that are not the last should be nodes, build them and nest
    const firstModule = await source.resolve(first)
    const firstNode = asNodeInstance(firstModule, () => 'first part is not a node')
    const newNode = await MemoryNode.create({ config: firstNode.config })
    await destination.register?.(newNode)
    await destination.attach(newNode.address, true)
    await attachToExistingNode(firstNode, parts.join(':'), newNode)
    return destination
  }
}
