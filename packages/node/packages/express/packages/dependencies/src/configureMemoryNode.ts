import { exists } from '@xylabs/exists'
import { Account } from '@xyo-network/account'
import { PayloadHasher } from '@xyo-network/core'
import {
  AddressHistoryDivinerConfigSchema,
  AddressSpaceDivinerConfigSchema,
  BoundWitnessDivinerConfigSchema,
  BoundWitnessStatsDivinerConfigSchema,
  PayloadDivinerConfigSchema,
  PayloadStatsDivinerConfigSchema,
  SchemaListDivinerConfigSchema,
  SchemaStatsDivinerConfigSchema,
} from '@xyo-network/diviner-models'
import {
  AnyConfigSchema,
  ArchivistConfigSchema,
  ArchivistInsertQuerySchema,
  ArchivistWrapper,
  CreatableModuleDictionary,
  MemoryNode,
  ModuleConfig,
} from '@xyo-network/modules'
import { TYPES } from '@xyo-network/node-core-types'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { PrometheusNodeWitnessConfigSchema } from '@xyo-network/prometheus-node-plugin'
import { Container } from 'inversify'

const config = { schema: NodeConfigSchema }

type ModuleConfigWithVisibility = [config: AnyConfigSchema<ModuleConfig>, visibility: boolean]

const archivists: ModuleConfigWithVisibility[] = [[{ schema: ArchivistConfigSchema }, true]]

const diviners: ModuleConfigWithVisibility[] = [
  [{ schema: AddressHistoryDivinerConfigSchema }, true],
  [{ schema: AddressSpaceDivinerConfigSchema }, true],
  [{ schema: BoundWitnessDivinerConfigSchema }, true],
  [{ schema: BoundWitnessStatsDivinerConfigSchema }, true],
  [{ schema: PayloadDivinerConfigSchema }, true],
  [{ schema: PayloadStatsDivinerConfigSchema }, true],
  [{ schema: SchemaListDivinerConfigSchema }, true],
  [{ schema: SchemaStatsDivinerConfigSchema }, true],
]
const witnesses: ModuleConfigWithVisibility[] = [[{ schema: PrometheusNodeWitnessConfigSchema }, true]] // TODO: If we set this to false the visible modules stop resolving

const configs: ModuleConfigWithVisibility[] = [...archivists, ...diviners, ...witnesses]

export const configureMemoryNode = async (container: Container, memoryNode?: MemoryNode, account = Account.random()) => {
  const node = memoryNode ?? ((await MemoryNode.create({ account, config })) as MemoryNode)
  container.bind<MemoryNode>(TYPES.Node).toConstantValue(node)
  await addModulesToNodeByConfig(container, node, configs)
  const configHashes = process.env.CONFIG_HASHES
  if (configHashes) {
    const hashes = configHashes.split(',').filter(exists)
    if (hashes.length) {
      const configPayloads: Record<string, ModuleConfig> = {}
      const mods = await node.downResolver.resolve({ query: [[ArchivistInsertQuerySchema]] })
      for (const mod of mods) {
        const archivist = ArchivistWrapper.wrap(mod)
        const payloads = await archivist.get(hashes)
        await Promise.all(
          payloads.map(async (payload) => {
            configPayloads[await PayloadHasher.hashAsync(payload)] = payload as ModuleConfig
          }),
        )
      }
      const additionalConfigs = Object.values(configPayloads).map<ModuleConfigWithVisibility>((configPayload) => [configPayload, true])
      await addModulesToNodeByConfig(container, node, additionalConfigs)
    }
  }
}

const addModulesToNodeByConfig = async (container: Container, node: MemoryNode, configs: ModuleConfigWithVisibility[]) => {
  const creatableModuleDictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  await Promise.all(configs.map(async ([config, visibility]) => await addModuleToNodeFromConfig(creatableModuleDictionary, node, config, visibility)))
}

const addModuleToNodeFromConfig = async (
  creatableModuleDictionary: CreatableModuleDictionary,
  node: MemoryNode,
  config: AnyConfigSchema<ModuleConfig>,
  visibility = true,
  account = Account.random(),
) => {
  const configModuleFactory = creatableModuleDictionary[config.schema]
  if (configModuleFactory) {
    const mod = await configModuleFactory.create({ account, config })
    const { address } = mod
    await node.register(mod)
    await node.attach(address, visibility)
  }
}
