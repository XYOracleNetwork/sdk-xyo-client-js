import { exists } from '@xylabs/exists'
import { fulfilled } from '@xylabs/promise'
import { AbstractModule, AddressModuleFilter, DynamicModuleResolver, MemoryNode, NameModuleFilter, NodeConfigSchema } from '@xyo-network/modules'
import { archivistRegex, ArchivistRegexResult } from '@xyo-network/node-core-lib'
import { ArchiveArchivist, ArchiveBoundWitnessArchivistFactory, ArchivePayloadArchivistFactory } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const config = { schema: NodeConfigSchema }

// TODO: Grab from actual type lists (which are not yet exported)
const archivists = [
  // TYPES.ArchiveArchivist,
  // TYPES.ArchiveBoundWitnessArchivistFactory,
  // TYPES.ArchivePayloadArchivistFactory,
  // TYPES.ArchivePermissionsArchivistFactory,
  TYPES.Archivist,
  TYPES.BoundWitnessArchivist,
  TYPES.PayloadArchivist,
  // TYPES.UserArchivist,
  // TYPES.WitnessedPayloadArchivist,
]

const diviners = [
  TYPES.AddressHistoryDiviner,
  TYPES.AddressSpaceDiviner,
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
  await addDependenciesToNodeByType(container, node, archivists)
  await addDependenciesToNodeByType(container, node, diviners)
  //  addDynamicArchivists(container, node)
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

const addDynamicArchivists = (container: Container, node: MemoryNode) => {
  const { downResolver } = node
  if (downResolver) {
    if ((downResolver as DynamicModuleResolver)?.resolveImplementation) {
      const dynamicResolver = downResolver as DynamicModuleResolver
      const archives = container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
      const archiveBoundWitnessArchivistFactory = container.get<ArchiveBoundWitnessArchivistFactory>(TYPES.ArchiveBoundWitnessArchivistFactory)
      const archivePayloadsArchivistFactory = container.get<ArchivePayloadArchivistFactory>(TYPES.ArchivePayloadArchivistFactory)
      dynamicResolver.resolveImplementation = async (filter) => {
        if (!filter) return []
        const filters: string[] = []
        if ((filter as AddressModuleFilter)?.address) filters.push(...(filter as AddressModuleFilter).address)
        if ((filter as NameModuleFilter)?.name) filters.push(...(filter as NameModuleFilter).name)
        const archivistFilters = filters.map((filter) => archivistRegex.exec(filter)?.groups as ArchivistRegexResult).filter(exists)
        if (archivistFilters.length) {
          const potentialArchives = await Promise.allSettled(archivistFilters.map((filter) => archives.find({ archive: filter.archive })))
          const existingArchives = potentialArchives
            .filter(fulfilled)
            .map((v) => v.value)
            .flat()
            .map((archive) => archive.archive)
          const modules = archivistFilters
            .filter((filter) => existingArchives.includes(filter.archive))
            .map((filter) => {
              // TODO: Get this string from module alongside name builder helpers
              return filter.type === 'boundwitness'
                ? archiveBoundWitnessArchivistFactory(filter.archive)
                : archivePayloadsArchivistFactory(filter.archive)
            })
          return await Promise.all(modules)
        }
        return []
      }
    }
  }
}
