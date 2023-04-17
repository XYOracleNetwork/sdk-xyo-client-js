import { AbstractModule, AnyConfigSchema, ArchivistConfigSchema, MemoryNode, ModuleConfig } from '@xyo-network/modules'
import { ConfigModuleFactoryDictionary } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { Container } from 'inversify'

const config = { schema: NodeConfigSchema }

type ModuleNameWithVisibility = [name: symbol, visibility: boolean]
type ModuleConfigWithVisibility = [config: AnyConfigSchema<ModuleConfig>, visibility: boolean]

const archivists: ModuleConfigWithVisibility[] = [[{ schema: ArchivistConfigSchema }, true]]

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
const witnesses: ModuleNameWithVisibility[] = [
  [TYPES.PrometheusWitness, true], // TODO: If we set this to false the visible modules stop resolving
]

const modules: ModuleNameWithVisibility[] = [...diviners, ...witnesses]
const configs: ModuleConfigWithVisibility[] = [...archivists]

export const addMemoryNode = async (container: Container, memoryNode?: MemoryNode) => {
  const node = memoryNode ?? ((await MemoryNode.create({ config })) as MemoryNode)
  container.bind<MemoryNode>(TYPES.Node).toConstantValue(node)
  await addModulesToNode(container, node, modules)
  await addModulesToNodeFromConfig(container, node, configs)
}

const addModulesToNode = async (container: Container, node: MemoryNode, modules: ModuleNameWithVisibility[]) => {
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

const addModulesToNodeFromConfig = async (container: Container, node: MemoryNode, configs: ModuleConfigWithVisibility[]) => {
  const configModuleFactoryDictionary = container.get<ConfigModuleFactoryDictionary>(TYPES.ConfigModuleFactoryDictionary)
  await Promise.all(
    configs.map(async ([config, visibility]) => {
      const configModuleFactory = configModuleFactoryDictionary[config.schema]
      if (configModuleFactory) {
        const mod = await configModuleFactory(config)
        const { address } = mod
        await node.register(mod)
        await node.attach(address, visibility)
      }
    }),
  )
}
