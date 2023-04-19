import { AddressSpaceDivinerConfigSchema, AnyConfigSchema, ArchivistConfigSchema, MemoryNode, ModuleConfig } from '@xyo-network/modules'
import { ConfigModuleFactoryDictionary } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { PrometheusNodeWitnessConfigSchema } from '@xyo-network/prometheus-node-plugin'
import { Container } from 'inversify'

const config = { schema: NodeConfigSchema }

type ModuleConfigWithVisibility = [config: AnyConfigSchema<ModuleConfig>, visibility: boolean]

const archivists: ModuleConfigWithVisibility[] = [[{ schema: ArchivistConfigSchema }, true]]

const diviners: ModuleConfigWithVisibility[] = [
  // [{ schema: 'TYPES.AddressHistoryDiviner' }, true],
  [{ schema: AddressSpaceDivinerConfigSchema }, true],
  // [{ schema: 'TYPES.BoundWitnessDiviner' }, true],
  // [{ schema: 'TYPES.BoundWitnessStatsDiviner' }, true],
  // [{ schema: 'TYPES.PayloadDiviner' }, true],
  // [{ schema: 'TYPES.PayloadStatsDiviner' }, true],
  // [{ schema: 'TYPES.SchemaListDiviner' }, true],
  // [{ schema: 'TYPES.SchemaStatsDiviner' }, true],
]
const witnesses: ModuleConfigWithVisibility[] = [[{ schema: PrometheusNodeWitnessConfigSchema }, true]] // TODO: If we set this to false the visible modules stop resolving

const configs: ModuleConfigWithVisibility[] = [...archivists, ...diviners, ...witnesses]

export const configureMemoryNode = async (container: Container, memoryNode?: MemoryNode) => {
  const node = memoryNode ?? ((await MemoryNode.create({ config })) as MemoryNode)
  container.bind<MemoryNode>(TYPES.Node).toConstantValue(node)
  await addModulesToNodeByConfig(container, node, configs)
}

const addModulesToNodeByConfig = async (container: Container, node: MemoryNode, configs: ModuleConfigWithVisibility[]) => {
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
