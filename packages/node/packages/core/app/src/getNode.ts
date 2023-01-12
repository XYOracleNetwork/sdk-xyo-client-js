import { Account } from '@xyo-network/account'
import { MemoryNode, MemoryNodeParams, NodeConfigSchema } from '@xyo-network/node'

import { configureEnvironment, configureTransports } from './configuration'

const config = { schema: NodeConfigSchema }

export const getNode = async (account = Account.random()): Promise<MemoryNode> => {
  const params: MemoryNodeParams = { account, config }
  const node = await MemoryNode.create(params)
  await configureEnvironment(node)
  await configureTransports(node)
  return node
}
