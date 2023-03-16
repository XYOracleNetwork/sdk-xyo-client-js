import { AbstractModule, MemoryNode } from '@xyo-network/modules'
import { TYPES } from '@xyo-network/node-core-types'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { Container } from 'inversify'

const config = { schema: NodeConfigSchema }

// TODO: Grab from actual type lists (which are not yet exported)
const archivists = [
  TYPES.Archivist,
  // TYPES.BoundWitnessArchivist,
  // TYPES.PayloadArchivist
]

const diviners = [
  TYPES.AddressHistoryDiviner,
  TYPES.AddressSpaceDiviner,
  TYPES.BoundWitnessDiviner,
  TYPES.BoundWitnessStatsDiviner,
  TYPES.PayloadDiviner,
  TYPES.PayloadStatsDiviner,
  TYPES.SchemaListDiviner,
  TYPES.SchemaStatsDiviner,
]

export const addMemoryNode = async (container: Container, memoryNode?: MemoryNode) => {
  const node = memoryNode ?? ((await MemoryNode.create({ config })) as MemoryNode)
  container.bind<MemoryNode>(TYPES.Node).toConstantValue(node)
  await addDependenciesToNodeByType(container, node, archivists)
  await addDependenciesToNodeByType(container, node, diviners)
}

const addDependenciesToNodeByType = async (container: Container, node: MemoryNode, types: symbol[]) => {
  await Promise.all(
    types.map(async (type) => {
      const mod = await container.getAsync<AbstractModule>(type)
      const address: string | undefined = mod?.address
      if (address) {
        await node.register(mod).attach(address, true)
      }
    }),
  )
}
