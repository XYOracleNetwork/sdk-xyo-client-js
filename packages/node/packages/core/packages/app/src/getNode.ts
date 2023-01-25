import { Account } from '@xyo-network/account'
import { DynamicModuleResolver } from '@xyo-network/modules'
import { MemoryNode, MemoryNodeParams, NodeConfigSchema } from '@xyo-network/node'

import { configureEnvironment, configureTransports } from './configuration'

const config = { schema: NodeConfigSchema }

export const getNode = async (account = Account.random()): Promise<MemoryNode> => {
  const resolver = new DynamicModuleResolver()
  const params: MemoryNodeParams = { account, config, resolver }
  const node = await MemoryNode.create(params)
  await configureEnvironment(node)
  await configureTransports(node)
  return node
}
