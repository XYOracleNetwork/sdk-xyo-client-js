import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Account, HDWallet } from '@xyo-network/account'
import { ArchivistInsertQuerySchema, isArchivistInstance, withArchivistInstance } from '@xyo-network/archivist-model'
import { PayloadHasher } from '@xyo-network/core'
import { ManifestWrapper, PackageManifestPayload } from '@xyo-network/manifest'
import { ModuleConfig, ModuleFactoryLocator } from '@xyo-network/module-model'
import { TYPES } from '@xyo-network/node-core-types'
import { NodeInstance } from '@xyo-network/node-model'
import { readFile } from 'fs/promises'
import { Container } from 'inversify'

import { nftContractNode } from './Manifest'
import defaultNode from './node.json'
import { witnessNftCollections } from './witnessNftCollections'

// TODO: How to inject account for node that is to be created from config?
export const configureMemoryNode = async (container: Container, memoryNode?: NodeInstance, _account = Account.randomSync()) => {
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
      // TODO: Register additional modules specified by hashes
    }
  }
  if (process.env.WITNESS_NFT_COLLECTIONS) {
    await witnessNftCollections(node)
  }
  console.log(await node.discover())
}

const loadNodeFromConfig = async (container: Container, config?: string) => {
  const manifest: PackageManifestPayload = config
    ? (JSON.parse(await readFile(config, 'utf8')) as PackageManifestPayload)
    : (defaultNode as PackageManifestPayload)
  // TODO: Import all public children from manifest once we're OK to move the image thumbnail
  // modules from the main node to a child node
  const manifestPublicChildren: PackageManifestPayload[] = config ? [] : [nftContractNode]
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const wallet = await HDWallet.fromPhrase(mnemonic)
  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  const wrapper = new ManifestWrapper(manifest, wallet, locator, manifestPublicChildren)
  const [parentNode, ...childNodes] = await wrapper.loadNodes()
  if (childNodes?.length) {
    await Promise.all(childNodes.map((childNode) => parentNode.register(childNode)))
    await Promise.all(childNodes.map((childNode) => parentNode.attach(childNode.address, true)))
  }
  return parentNode
}
