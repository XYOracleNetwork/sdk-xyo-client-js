import { AbstractNode, MemoryNode, NodeConfigSchema, XyoModule } from '@xyo-network/modules'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const config = { schema: NodeConfigSchema }

export const addMemoryNode = async (container: Container) => {
  const node = await MemoryNode.create({ config: config })
  const modules = container.getAll<XyoModule>(TYPES.Module)
  modules.map((mod) => {
    node.register(mod)
    node.attach(mod.address)
  })
  container.bind<AbstractNode>(TYPES.Node).toConstantValue(node)
}
