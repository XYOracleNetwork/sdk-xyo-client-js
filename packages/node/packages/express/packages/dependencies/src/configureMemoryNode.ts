import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Account, HDWallet } from '@xyo-network/account'
import { ArchivistInsertQuerySchema, isArchivistInstance, withArchivistInstance } from '@xyo-network/archivist-model'
import { PayloadHasher } from '@xyo-network/core'
import { ManifestPayload, ManifestWrapper } from '@xyo-network/manifest'
import { AnyConfigSchema, CreatableModuleDictionary, ModuleConfig } from '@xyo-network/module-model'
import { TYPES } from '@xyo-network/node-core-types'
import { NodeInstance } from '@xyo-network/node-model'
import { readFile } from 'fs/promises'
import { Container } from 'inversify'

import { witnessNftCollections } from './witnessNftCollections'

type ModuleConfigWithVisibility<T extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> = [config: T, visibility: boolean]

export const configureMemoryNode = async (container: Container, memoryNode?: NodeInstance, account = Account.randomSync()) => {
  const node = await loadNodeFromConfig(container)
  // const node: NodeInstance = memoryNode ?? (await MemoryNode.create({ account, config }))
  container.bind<NodeInstance>(TYPES.Node).toConstantValue(node)
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
  console.log(await node.discover())
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

const loadNodeFromConfig = async (container: Container, config: string = 'node.json') => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  const wallet = await HDWallet.fromMnemonic(mnemonic)
  const file = JSON.parse(await readFile(config, 'utf8'))
  const manifest = file as ManifestPayload
  const wrapper = new ManifestWrapper(manifest, wallet)
  const [node] = await wrapper.loadNodes(undefined, dictionary)
  return node
}
