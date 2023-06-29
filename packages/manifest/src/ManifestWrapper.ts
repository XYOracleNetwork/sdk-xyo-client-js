import { assertEx } from '@xylabs/assert'
import { CreatableModuleDictionary } from '@xyo-network/module'
import { MemoryNode, NodeModule, NodeWrapper } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { WalletInstance } from '@xyo-network/wallet-model'

import { standardCreatableModules } from './ModuleFactory'
import { ManifestPayload, ModuleManifest, NodeManifest } from './Payload'

export class ManifestWrapper extends PayloadWrapper<ManifestPayload> {
  constructor(payload: ManifestPayload, protected wallet: WalletInstance) {
    super(payload)
  }

  async loadModule(node: NodeWrapper<MemoryNode>, manifest: ModuleManifest, external = true, additionalCreatableModules?: CreatableModuleDictionary) {
    const collision = async (node: NodeModule, name: string, external: boolean) => {
      const externalConflict = external ? (await (external ? node.upResolver : node.downResolver).resolve({ name: [name] })).length !== 0 : false
      return externalConflict || (await node.downResolver.resolve({ name: [name] })).length !== 0
    }

    const creatableModules = { ...standardCreatableModules, ...additionalCreatableModules }
    if (!(await collision(node, manifest.config.name, external))) {
      if (manifest.config.language && manifest.config.language === 'javascript') {
        assertEx(
          (manifest.config.name && (await node.attach(manifest.config.name, external))) ??
            (await node.attach((await this.registerModule(node, manifest, creatableModules)).address, external)),
          `No module with config schema [${manifest.config.name}] registered`,
        )
      }
    }
  }

  async loadNodeFromIndex(node: MemoryNode, index: number, additionalCreatableModules?: CreatableModuleDictionary) {
    return await this.loadNodeFromManifest(node, assertEx(this.nodeManifest(index), 'Failed to find Node Manifest'), additionalCreatableModules)
  }

  async loadNodeFromManifest(node: MemoryNode, manifest: NodeManifest, additionalCreatableModules?: CreatableModuleDictionary) {
    const nodeWrapper = NodeWrapper.wrap<NodeWrapper<MemoryNode>>(node)
    // Load Private Modules
    await Promise.all(
      manifest.modules?.private?.map(async (moduleManifest) => {
        await this.loadModule(nodeWrapper, moduleManifest, false, additionalCreatableModules)
      }) ?? [() => null],
    )

    // Load Public Modules
    await Promise.all(
      manifest.modules?.public?.map(async (moduleManifest) => {
        await this.loadModule(nodeWrapper, moduleManifest, true, additionalCreatableModules)
      }) ?? [() => null],
    )

    return node
  }

  async loadNodes(node?: MemoryNode, additionalCreatableModules?: CreatableModuleDictionary) {
    return await Promise.all(
      this.payload().nodes?.map(async (nodeManifest, index) => {
        const subNode = await MemoryNode.create({ config: { schema: 'network.xyo.node.config' }, wallet: await this.wallet.derivePath(`${index}'`) })
        await node?.register(subNode)
        await this.loadNodeFromManifest(subNode, nodeManifest, additionalCreatableModules)
        return subNode
      }),
    )
  }

  nodeManifest(index: number) {
    return this.payload().nodes?.[index]
  }

  async registerModule(node: NodeWrapper<MemoryNode>, manifest: ModuleManifest, creatableModules?: CreatableModuleDictionary) {
    const creatableModule = assertEx(
      creatableModules?.[manifest.config.schema],
      `No module with [${manifest.config.schema}] config schema available for registration`,
    )

    const module = await creatableModule.create({
      account: manifest.config.accountPath ? await this.wallet.derivePath(manifest.config.accountPath) : this.wallet,
      config: assertEx(manifest.config, 'Missing config'),
    })
    await node.module.register(module)
    return module
  }
}
