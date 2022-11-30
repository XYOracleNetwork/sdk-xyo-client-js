import { MemoryNode, NodeConfigSchema, XyoModule } from '@xyo-network/modules'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const config = { schema: NodeConfigSchema }

const archivists = [
  // TYPES.ArchiveArchivist,
  // TYPES.ArchiveBoundWitnessArchivistFactory,
  // TYPES.ArchiveKeyArchivist,
  // TYPES.ArchivePayloadArchivistFactory,
  // TYPES.ArchivePermissionsArchivistFactory,
  TYPES.BoundWitnessArchivist,
  TYPES.PayloadArchivist,
  // TYPES.UserArchivist,
  TYPES.WitnessedPayloadArchivist,
]

const diviners = [
  TYPES.AddressHistoryDiviner,
  TYPES.BoundWitnessDiviner,
  TYPES.BoundWitnessStatsDiviner,
  TYPES.ModuleAddressDiviner,
  TYPES.PayloadDiviner,
  TYPES.PayloadStatsDiviner,
  TYPES.SchemaStatsDiviner,
]

export const addMemoryNode = async (container: Container) => {
  const node = await MemoryNode.create({ config: config })
  const modules = container.getAll<XyoModule>(TYPES.Module)
  modules.map((mod) => {
    node.register(mod)
    node.attach(mod.address)
  })
  container.bind<MemoryNode>(TYPES.Node).toConstantValue(node)
  await addArchivists(container, node)
  await addDiviners(container, node)
}

const addArchivists = async (container: Container, node: MemoryNode) => {
  await Promise.all(
    archivists.map(async (type) => {
      const mod = await container.getAsync<XyoModule>(type)
      node.attach(mod.address, type.description)
    }),
  )
}

const addDiviners = async (container: Container, node: MemoryNode) => {
  await Promise.all(
    diviners.map(async (type) => {
      const mod = await container.getAsync<XyoModule>(type)
      node.attach(mod.address, type.description)
    }),
  )
}
