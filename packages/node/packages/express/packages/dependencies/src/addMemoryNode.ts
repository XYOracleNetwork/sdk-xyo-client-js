import { AbstractModule, MemoryNode } from '@xyo-network/modules'
import { TYPES } from '@xyo-network/node-core-types'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { Container } from 'inversify'

const config = { schema: NodeConfigSchema }

type ModuleNameWithVisibility = [name: symbol, visibility: boolean]

const archivists: ModuleNameWithVisibility[] = [[TYPES.Archivist, true]]
const diviners: ModuleNameWithVisibility[] = [
  [TYPES.AddressHistoryDiviner, true],
  [TYPES.AddressSpaceDiviner, true],
  [TYPES.BoundWitnessDiviner, true],
  [TYPES.BoundWitnessStatsDiviner, true],
  [TYPES.PayloadDiviner, true],
  [TYPES.PayloadStatsDiviner, true],
  [TYPES.SchemaListDiviner, true],
  [TYPES.SchemaStatsDiviner, true],
]
const witnesses: ModuleNameWithVisibility[] = [[TYPES.PrometheusWitness, false]]

const modules: ModuleNameWithVisibility[] = [...archivists, ...diviners, ...witnesses]

export const addMemoryNode = async (container: Container, memoryNode?: MemoryNode) => {
  const node = memoryNode ?? ((await MemoryNode.create({ config })) as MemoryNode)
  container.bind<MemoryNode>(TYPES.Node).toConstantValue(node)
  await addDependenciesToNodeByType(container, node, modules)
}

const addDependenciesToNodeByType = async (container: Container, node: MemoryNode, modules: ModuleNameWithVisibility[]) => {
  await Promise.all(
    modules.map(async ([name, visibility]) => {
      const mod = await container.getAsync<AbstractModule>(name)
      if (mod) {
        const { address } = mod
        await node.register(mod)
        await node.attach(address, visibility)
      }
    }),
  )
}
