import { AbstractModule, MemoryNode, NodeConfigSchema } from '@xyo-network/modules'
import { ArchiveArchivist, ArchiveBoundWitnessArchivistFactory, ArchivePayloadsArchivistFactory } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const config = { schema: NodeConfigSchema }

// TODO: Grab from actual type lists (which are not yet exported)
const archivists = [
  // TYPES.ArchiveArchivist,
  // TYPES.ArchiveBoundWitnessArchivistFactory,
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

export const addMemoryNode = async (container: Container, memoryNode?: MemoryNode) => {
  const node = memoryNode ?? (await MemoryNode.create({ config }))
  container.bind<MemoryNode>(TYPES.Node).toConstantValue(node)
  const modules = container.getAll<AbstractModule>(TYPES.Module)
  modules.map((mod) => {
    node.register(mod)
    node.attach(mod.address)
  })
  await addDependenciesToNodeByType(container, node, archivists)
  await addDependenciesToNodeByType(container, node, diviners)
  await addArchives(container, node)
}

const addDependenciesToNodeByType = async (container: Container, node: MemoryNode, types: symbol[]) => {
  await Promise.all(
    types.map(async (type) => {
      const mod = await container.getAsync<AbstractModule>(type)
      const address: string | undefined = mod?.address
      if (address) node.attach(address, type.description)
    }),
  )
}

const addArchives = async (container: Container, node: MemoryNode) => {
  const archiveArchivist = container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
  const archives = (await archiveArchivist?.all?.()) || []
  // TODO: Merge BW's & Payloads into single module?
  const archiveBoundWitnessArchivistFactory = container.get<ArchiveBoundWitnessArchivistFactory>(TYPES.ArchiveBoundWitnessArchivistFactory)
  const archivePayloadArchivistFactory = container.get<ArchivePayloadsArchivistFactory>(TYPES.ArchivePayloadArchivistFactory)
  for (const archive of archives) {
    const payloadsArchivist = archivePayloadArchivistFactory(archive.archive)
    const payloadsArchivistName = `${archive.archive}/payload`
    node.register(payloadsArchivist)
    node.attach(payloadsArchivist.address, payloadsArchivistName)

    const bwArchivist = archivePayloadArchivistFactory(archive.archive)
    const bwArchivistName = `${archive.archive}/boundwitness`
    node.register(bwArchivist)
    node.attach(bwArchivist.address, bwArchivistName)
  }
}
