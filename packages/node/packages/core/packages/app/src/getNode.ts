import { Account } from '@xyo-network/account'
import { DynamicModuleResolver } from '@xyo-network/modules'
import { MemoryNode, MemoryNodeParams, NodeConfigSchema } from '@xyo-network/node'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'

import { configureEnvironment, configureTransports } from './configuration'

const config = { schema: NodeConfigSchema }

export class DynamicMemoryNode extends MemoryNode {
  override readonly downResolver = new DynamicModuleResolver()
  static override async create(params?: Partial<MemoryNodeParams>): Promise<DynamicMemoryNode> {
    return (await super.create(params)) as DynamicMemoryNode
  }
}

export const getNode = async (account = Account.random()): Promise<MemoryNode> => {
  PayloadValidator.setSchemaNameValidatorFactory((schema) => new XyoSchemaNameValidator(schema))
  const params: MemoryNodeParams = { account, config }
  const node = await DynamicMemoryNode.create(params)
  await configureEnvironment(node)
  await configureTransports(node)
  return node
}
