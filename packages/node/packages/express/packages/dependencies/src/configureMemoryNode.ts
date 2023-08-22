import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Account } from '@xyo-network/account'
import {
  ArchivistConfig,
  ArchivistConfigSchema,
  ArchivistInsertQuerySchema,
  isArchivistInstance,
  withArchivistInstance,
} from '@xyo-network/archivist-model'
import { PayloadHasher } from '@xyo-network/core'
import { NftCollectionScoreDivinerConfigSchema, NftCollectionWitnessConfigSchema } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { NftScoreDivinerConfigSchema, NftWitnessConfigSchema } from '@xyo-network/crypto-nft-payload-plugin'
import {
  AddressHistoryDivinerConfigSchema,
  AddressSpaceBatchDivinerConfigSchema,
  AddressSpaceDivinerConfigSchema,
  BoundWitnessDivinerConfigSchema,
  BoundWitnessStatsDivinerConfigSchema,
  PayloadDivinerConfigSchema,
  PayloadStatsDivinerConfigSchema,
  SchemaListDivinerConfigSchema,
  SchemaStatsDivinerConfigSchema,
} from '@xyo-network/diviner-models'
import { ImageThumbnailDivinerConfigSchema, ImageThumbnailWitnessConfigSchema } from '@xyo-network/image-thumbnail-plugin'
import { AnyConfigSchema, CreatableModuleDictionary, ModuleConfig } from '@xyo-network/module-model'
import { MongoDBDeterministicArchivistConfig, MongoDBDeterministicArchivistConfigSchema } from '@xyo-network/node-core-modules-mongo'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema, NodeInstance } from '@xyo-network/node-model'
import { PrometheusNodeWitnessConfigSchema } from '@xyo-network/prometheus-node-plugin'
import { Container } from 'inversify'

import { witnessNftCollections } from './witnessNftCollections'

const config = { schema: NodeConfigSchema }

type ModuleConfigWithVisibility<T extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> = [config: T, visibility: boolean]

const archivists: ModuleConfigWithVisibility<AnyConfigSchema<ArchivistConfig> | AnyConfigSchema<MongoDBDeterministicArchivistConfig>>[] = [
  [{ schema: ArchivistConfigSchema }, true],
  [
    {
      accountDerivationPath: WALLET_PATHS.Archivists.ThumbnailArchivist,
      name: 'ThumbnailArchivist',
      payloadSdkConfig: { collection: 'thumbnail' },
      schema: MongoDBDeterministicArchivistConfigSchema,
    },
    true,
  ],
]

const diviners: ModuleConfigWithVisibility[] = [
  [{ schema: AddressHistoryDivinerConfigSchema }, true],
  [{ schema: AddressSpaceDivinerConfigSchema }, true],
  [{ schema: AddressSpaceBatchDivinerConfigSchema }, true],
  [{ schema: BoundWitnessDivinerConfigSchema }, true],
  [{ schema: BoundWitnessStatsDivinerConfigSchema }, true],
  [{ schema: NftCollectionScoreDivinerConfigSchema }, true],
  [{ schema: NftScoreDivinerConfigSchema }, true],
  [{ schema: PayloadDivinerConfigSchema }, true],
  [{ schema: PayloadStatsDivinerConfigSchema }, true],
  [{ schema: SchemaListDivinerConfigSchema }, true],
  [{ schema: SchemaStatsDivinerConfigSchema }, true],
  [{ schema: ImageThumbnailDivinerConfigSchema }, true],
]
const witnesses: ModuleConfigWithVisibility[] = [
  [{ schema: NftCollectionWitnessConfigSchema }, true],
  [{ schema: NftWitnessConfigSchema }, true],
  [{ schema: ImageThumbnailWitnessConfigSchema }, true],
  [{ schema: PrometheusNodeWitnessConfigSchema }, false],
]

const configs: ModuleConfigWithVisibility[] = [...archivists, ...diviners, ...witnesses]

export const configureMemoryNode = async (container: Container, memoryNode?: NodeInstance, account = Account.randomSync()) => {
  const node: NodeInstance = memoryNode ?? (await MemoryNode.create({ account, config }))
  container.bind<NodeInstance>(TYPES.Node).toConstantValue(node)
  await addModulesToNodeByConfig(container, node, configs)
  const configHashes = process.env.CONFIG_HASHES
  if (configHashes) {
    const hashes = configHashes.split(',').filter(exists)
    if (hashes.length) {
      const configPayloads: Record<string, ModuleConfig> = {}
      const mods = await node.resolve({ query: [[ArchivistInsertQuerySchema]] }, { direction: 'down', identity: isArchivistInstance })
      for (const mod of mods) {
        await withArchivistInstance(mod, async (archivist) => {
          const payloads = await archivist.get(hashes)
          await Promise.all(
            payloads.map(async (payload) => {
              configPayloads[await PayloadHasher.hashAsync(assertEx(payload, 'Received null payload'))] = payload as ModuleConfig
            }),
          )
        })
      }
      const additionalConfigs = Object.values(configPayloads).map<ModuleConfigWithVisibility>((configPayload) => [configPayload, true])
      await addModulesToNodeByConfig(container, node, additionalConfigs)
    }
  }
  if (process.env.WITNESS_NFT_COLLECTIONS) {
    await witnessNftCollections(node)
  }
}

const addModulesToNodeByConfig = async (container: Container, node: NodeInstance, configs: ModuleConfigWithVisibility[]) => {
  const creatableModuleDictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  await Promise.all(configs.map(async ([config, visibility]) => await addModuleToNodeFromConfig(creatableModuleDictionary, node, config, visibility)))
}

const addModuleToNodeFromConfig = async (
  creatableModuleDictionary: CreatableModuleDictionary,
  node: NodeInstance,
  config: AnyConfigSchema<ModuleConfig>,
  visibility = true,
) => {
  const configModuleFactory = creatableModuleDictionary[config.schema]
  if (configModuleFactory) {
    const mod = await configModuleFactory.create({ config })
    const { address } = mod
    await node.register(mod)
    await node.attach(address, visibility)
  }
}
