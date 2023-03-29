import { Account } from '@xyo-network/account'
import { MemoryNode, MemoryNodeParams } from '@xyo-network/node'
import { WALLET_PATHS } from '@xyo-network/node-core-types'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'

import { configureEnvironment, configureTransports } from './configuration'

const config = { schema: NodeConfigSchema }

const mnemonic = process.env.MNEMONIC || ''
const path = WALLET_PATHS.Nodes.Node

export const getNode = async (account = Account.fromMnemonic(mnemonic, path)): Promise<MemoryNode> => {
  PayloadValidator.setSchemaNameValidatorFactory((schema: string) => new XyoSchemaNameValidator(schema))
  const params: MemoryNodeParams = { account, config }
  const node = (await MemoryNode.create(params)) as MemoryNode
  await configureEnvironment(node)
  await configureTransports(node)
  return node
}
