import { assertEx } from '@xylabs/assert'
import { ManifestPayload, ModuleManifest, NodeManifest } from '@xyo-network/manifest-model'
import { CreatableModuleDictionary } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeInstance } from '@xyo-network/node-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { WalletInstance } from '@xyo-network/wallet-model'

import { standardCreatableModules } from './standardCreatableModules'

export class ManifestWrapper extends PayloadWrapper<ManifestPayload> {
  constructor(
    payload: ManifestPayload,
    protected wallet: WalletInstance,
  ) {
    super(payload)
  }

  async loadModule(node: MemoryNode, manifest: ModuleManifest, external = true, additionalCreatableModules?: CreatableModuleDictionary) {
    const collision = async (node: NodeInstance, name: string, external: boolean) => {
      const externalConflict = external ? (await node.resolve({ name: [name] }, { direction: external ? 'all' : 'down' })).length !== 0 : false
      return externalConflict || (await node.resolve({ name: [name] }, { direction: 'down' })).length !== 0
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

  async loadNodeFromIndex(index: number, additionalCreatableModules?: CreatableModuleDictionary) {
    const manifest = assertEx(this.nodeManifest(index), 'Failed to find Node Manifest')
    return await this.loadNodeFromManifest(manifest, manifest.config.accountPath ?? `${index}'`, additionalCreatableModules)
  }

  async loadNodeFromManifest(manifest: NodeManifest, path: string, additionalCreatableModules?: CreatableModuleDictionary) {
    const node = await MemoryNode.create({ config: manifest.config, wallet: await this.wallet.derivePath(path) })
    await Promise.all([
      // Load Private Modules
      Promise.all(
        manifest.modules?.private?.map(async (moduleManifest) => {
          await this.loadModule(node, moduleManifest, false, additionalCreatableModules)
        }) ?? [() => null],
      ),
      // Load Public Modules
      Promise.all(
        manifest.modules?.public?.map(async (moduleManifest) => {
          await this.loadModule(node, moduleManifest, true, additionalCreatableModules)
        }) ?? [() => null],
      ),
    ])
    return node
  }

  async loadNodes(node?: MemoryNode, additionalCreatableModules?: CreatableModuleDictionary) {
    const start = Date.now()
    const result = await Promise.all(
      this.payload().nodes?.map(async (nodeManifest, index) => {
        const subNode = await this.loadNodeFromManifest(nodeManifest, nodeManifest.config.accountPath ?? `${index}'`, additionalCreatableModules)
        await node?.register(subNode)
        return subNode
      }),
    )
    console.log(`Loaded nodes from manifest in ${Date.now() - start}ms`)
    return result
  }

  nodeManifest(index: number) {
    return this.payload().nodes?.[index]
  }

  async registerModule(node: MemoryNode, manifest: ModuleManifest, creatableModules?: CreatableModuleDictionary) {
    const creatableModule = assertEx(
      creatableModules?.[manifest.config.schema],
      `No module with [${manifest.config.schema}] config schema available for registration`,
    )

    const module = await creatableModule.create({
      account: manifest.config.accountPath ? await this.wallet.derivePath(manifest.config.accountPath) : this.wallet,
      config: assertEx(manifest.config, 'Missing config'),
    })
    await node.register(module)
    return module
  }
}
