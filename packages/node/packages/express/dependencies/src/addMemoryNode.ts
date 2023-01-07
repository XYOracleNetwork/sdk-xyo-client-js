import { fulfilled } from '@xylabs/promise'
import { AbstractModule, DynamicModuleResolver, MemoryNode, NodeConfigSchema } from '@xyo-network/modules'
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

const addArchives = (container: Container, node: MemoryNode) => {
  const { resolver } = node
  if (resolver) {
    if ((resolver as DynamicModuleResolver)?.resolveImplementation) {
      const dynamicModuleResolver = resolver as DynamicModuleResolver
      const archiveArchivist = container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
      const archiveBoundWitnessArchivistFactory = container.get<ArchiveBoundWitnessArchivistFactory>(TYPES.ArchiveBoundWitnessArchivistFactory)
      const archivePayloadArchivistFactory = container.get<ArchivePayloadsArchivistFactory>(TYPES.ArchivePayloadArchivistFactory)
      dynamicModuleResolver.resolveImplementation = async (filter) => {
        const archives = filter?.address || filter?.name
        if (archives?.length) {
          // TODO: Payload OR BW
          const attempted = await Promise.allSettled(archives.map((archive) => archiveArchivist.find({ archive })))
          const existing = attempted
            .filter(fulfilled)
            .map((v) => v.value)
            .flat()
            .map((archive) => archive.archive)
            .map(archivePayloadArchivistFactory)
          return existing
        }
        return []
      }
    }
  }
}
