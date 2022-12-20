import { Account } from '@xyo-network/account'
import { MemoryNode, NodeConfigSchema } from '@xyo-network/node'

import { configureEnvironment, configureTransports } from './configuration'

export const getNode = async (): Promise<MemoryNode> => {
  const account = Account.random()
  const params = { account, config: { schema: NodeConfigSchema } }
  const node = await MemoryNode.create(params)
  await configureEnvironment(node)
  await configureTransports(node)
  return node
}
