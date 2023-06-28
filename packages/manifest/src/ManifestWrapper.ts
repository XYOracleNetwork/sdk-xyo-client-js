import { assertEx } from '@xylabs/assert'
import { CreatableModuleDictionary } from '@xyo-network/module'
import { MemoryNode, NodeWrapper } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { WalletInstance } from '@xyo-network/wallet-model'

import { standardCreatableModules } from './ModuleFactory'
import { DappManifest, ManifestPayload, ModuleManifest } from './Payload'

export class ManifestWrapper extends PayloadWrapper<ManifestPayload> {
  constructor(payload: ManifestPayload, protected wallet: WalletInstance) {
    super(payload)
  }

  dAppManifest(id: string) {
    return this.payload().dapps?.find((dapp) => dapp.id === id)
  }

  async loadDappFromId(node: MemoryNode, id: string, additionalCreatableModules?: CreatableModuleDictionary) {
    return await this.loadDappFromManifest(node, assertEx(this.dAppManifest(id), 'Failed to find dApp Manifest'), additionalCreatableModules)
  }

  async loadDappFromManifest(node: MemoryNode, manifest: DappManifest, additionalCreatableModules?: CreatableModuleDictionary) {
    const nodeWrapper = NodeWrapper.wrap<NodeWrapper<MemoryNode>>(node)
    // Load Private Modules
    await Promise.all(
      manifest.modules?.private?.map(async (moduleManifest) => {
        await this.loadModule(
          nodeWrapper,
          assertEx(this.resolveModuleManifest(moduleManifest), 'Unable to resolve module manifest'),
          false,
          additionalCreatableModules,
        )
      }) ?? [() => null],
    )

    // Load Public Modules
    await Promise.all(
      manifest.modules?.public?.map(async (moduleManifest) => {
        await this.loadModule(
          nodeWrapper,
          assertEx(this.resolveModuleManifest(moduleManifest), 'Unable to resolve module manifest'),
          true,
          additionalCreatableModules,
        )
      }) ?? [() => null],
    )

    return node
  }

  async loadDapps(node?: MemoryNode, additionalCreatableModules?: CreatableModuleDictionary) {
    return await Promise.all(
      this.payload().dapps?.map(async (dappManifest, index) => {
        const subNode = await MemoryNode.create({ config: { schema: 'network.xyo.node.config' }, wallet: await this.wallet.derivePath(`${index}'`) })
        await node?.register(subNode)
        await this.loadDappFromManifest(subNode, dappManifest, additionalCreatableModules)
        return subNode
      }),
    )
  }

  async loadModule(node: NodeWrapper<MemoryNode>, manifest: ModuleManifest, external = true, additionalCreatableModules?: CreatableModuleDictionary) {
    const creatableModules = { ...standardCreatableModules, ...additionalCreatableModules }
    const nodeWrapper = NodeWrapper.wrap(node)
    if (!manifest.name || (await (external ? nodeWrapper.downResolver : nodeWrapper.upResolver).resolve({ name: [manifest.name] })).length === 0) {
      if (manifest.language && manifest.language === 'javascript') {
        const id = manifest.id
        assertEx(
          (manifest.name && (await node.attach(manifest.name, external))) ??
            (id ? await node.attach((await this.registerModule(node, manifest, creatableModules)).address, external) : undefined),
          `No module named [${manifest.name}] registered`,
        )
      }
    }
  }

  async registerModule(node: NodeWrapper<MemoryNode>, manifest: ModuleManifest, creatableModules?: CreatableModuleDictionary) {
    const creatableModule = assertEx(
      creatableModules?.[assertEx(manifest.id, 'Attempting to create a module without an id')],
      `No module with [${manifest.id}] id available for registration`,
    )

    const module = await creatableModule.create({
      account: manifest.accountPath ? await this.wallet.derivePath(manifest.accountPath) : this.wallet,
      config: assertEx(manifest.config, 'Missing config'),
    })
    await node.module.register(module)
    return module
  }

  resolveModuleManifest(manifest?: ModuleManifest) {
    if (manifest?.name && !manifest.id) {
      return this.payload().modules?.[manifest.name]
    }
    return manifest
  }
}
