import { HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { WALLET_PATHS } from '@xyo-network/node-core-types'
import { MemoryNode, MemoryNodeParams } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { SchemaNameValidator } from '@xyo-network/schema-name-validator'

import { configureEnvironment, configureTransports } from './configuration'

const name = 'XYOPublic'
const config = { name, schema: NodeConfigSchema }

export const getNode = async (account?: AccountInstance): Promise<MemoryNode> => {
  await configureEnvironment()
  if (!account) {
    const mnemonic = process.env.MNEMONIC || ''
    const path = WALLET_PATHS.Nodes.Node
    account = await (await HDWallet.fromPhrase(mnemonic)).derivePath?.(path)
  }
  PayloadValidator.setSchemaNameValidatorFactory((schema: string) => new SchemaNameValidator(schema))
  const params: MemoryNodeParams = { account, config }
  const node = await MemoryNode.create(params)
  await configureTransports(node)
  return node
}
