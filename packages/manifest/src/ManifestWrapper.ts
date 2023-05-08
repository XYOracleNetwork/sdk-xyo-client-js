import { assertEx } from '@xylabs/assert'
import { MemoryNode, NodeWrapper } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { CreatableModuleDictionary, standardCreatableModules } from './CreatableModules'
import { DappManifest, ManifestPayload, ModuleManifest } from './Payload'

export class ManifestWrapper extends PayloadWrapper<ManifestPayload> {
  dAppManifest(id: string) {
    return this.payload.dapps?.find((dapp) => dapp.id === id)
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
      this.payload.dapps?.map(async (dappManifest) => {
        const subNode = await MemoryNode.create()
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
    const module = assertEx(
      await creatableModules?.[assertEx(manifest.id, 'Attempting to create a module without an id')]?.create(
        manifest.config ? { config: manifest.config } : undefined,
      ),
      `No module with [${manifest.id}] id available for registration`,
    )
    await node.module.register(module)
    return module
  }

  resolveModuleManifest(manifest?: ModuleManifest) {
    if (manifest?.name && !manifest.id) {
      return this.payload.modules?.[manifest.name]
    }
    return manifest
  }
}
