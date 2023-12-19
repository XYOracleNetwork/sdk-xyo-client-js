import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { ModuleManifest, NodeManifest, PackageManifestPayload } from '@xyo-network/manifest-model'
import {
  assignCreatableModuleRegistry,
  CreatableModuleDictionary,
  CreatableModuleRegistry,
  ModuleFactoryLocator,
  ModuleInstance,
  toCreatableModuleRegistry,
} from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeInstance } from '@xyo-network/node-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { WalletInstance } from '@xyo-network/wallet-model'

import { standardCreatableModules } from './standardCreatableModules'

/** Provides functionality that can be performed on a PackageManifest */
export class ManifestWrapper extends PayloadWrapper<PackageManifestPayload> {
  constructor(
    payload: PackageManifestPayload,
    protected readonly wallet: WalletInstance,
    protected readonly locator: ModuleFactoryLocator = new ModuleFactoryLocator({}),
    protected readonly publicChildren: PackageManifestPayload[] = [],
    protected readonly privateChildren: PackageManifestPayload[] = [],
  ) {
    super(payload)
  }

  async loadModule(node: MemoryNode, manifest: ModuleManifest, external: boolean, additionalCreatableModules?: CreatableModuleRegistry): Promise<void>
  async loadModule(
    node: MemoryNode,
    manifest: ModuleManifest,
    external: boolean,
    additionalCreatableModules?: CreatableModuleDictionary,
  ): Promise<void>
  async loadModule(
    node: MemoryNode,
    manifest: ModuleManifest,
    external = true,
    additionalCreatableModules?: CreatableModuleDictionary | CreatableModuleRegistry,
  ): Promise<void> {
    const collision = async (node: NodeInstance, name: string, external: boolean) => {
      const externalConflict = external ? (await node.resolve({ name: [name] }, { direction: external ? 'all' : 'down' })).length > 0 : false
      return externalConflict || (await node.resolve({ name: [name] }, { direction: 'down' })).length > 0
    }

    const creatableModules = assignCreatableModuleRegistry(
      {},
      toCreatableModuleRegistry(standardCreatableModules),
      toCreatableModuleRegistry(additionalCreatableModules ?? {}),
    )
    if (!(await collision(node, manifest.config.name, external))) {
      assertEx(
        (manifest.config.name && (await node.attach(manifest.config.name, external))) ??
          (await node.attach((await this.registerModule(node, manifest, creatableModules)).address, external)),
        `No module with config schema [${manifest.config.name}] registered`,
      )
    }
  }

  async loadNodeFromIndex(index: number, additionalCreatableModules?: CreatableModuleRegistry): Promise<MemoryNode>
  async loadNodeFromIndex(index: number, additionalCreatableModules?: CreatableModuleDictionary): Promise<MemoryNode>
  async loadNodeFromIndex(index: number, additionalCreatableModules?: CreatableModuleDictionary | CreatableModuleRegistry): Promise<MemoryNode> {
    const manifest = assertEx(this.nodeManifest(index), 'Failed to find Node Manifest')
    const registry = toCreatableModuleRegistry(additionalCreatableModules ?? {})
    return await this.loadNodeFromManifest(manifest, manifest.config.accountPath ?? `${index}'`, registry)
  }

  async loadNodeFromManifest(manifest: NodeManifest, path: string, additionalCreatableModules?: CreatableModuleRegistry): Promise<MemoryNode>
  async loadNodeFromManifest(manifest: NodeManifest, path: string, additionalCreatableModules?: CreatableModuleDictionary): Promise<MemoryNode>
  async loadNodeFromManifest(
    manifest: NodeManifest,
    path?: string,
    additionalCreatableModules?: CreatableModuleDictionary | CreatableModuleRegistry,
  ): Promise<MemoryNode> {
    const wallet = path ? await this.wallet.derivePath(path) : undefined
    const account = path ? undefined : Account.randomSync()
    const node = await MemoryNode.create({ account, config: manifest.config, wallet })
    const registry = toCreatableModuleRegistry(additionalCreatableModules ?? {})
    // Load Private Modules
    const privateModules =
      manifest.modules?.private?.map(async (moduleManifest) => {
        await this.loadModule(node, moduleManifest, false, registry)
      }) ?? []
    // Load Public Modules
    const publicModules =
      manifest.modules?.public?.map(async (moduleManifest) => {
        await this.loadModule(node, moduleManifest, true, registry)
      }) ?? []
    await Promise.all([...privateModules, ...publicModules])

    await Promise.all(
      this.privateChildren.map(async (child) => {
        const wrapper = new ManifestWrapper(child, this.wallet, this.locator)
        const subNodes = await wrapper.loadNodes(node)
        for (const subNode of subNodes) {
          node.attach(subNode.address, false)
        }
      }),
    )

    await Promise.all(
      this.publicChildren.map(async (child) => {
        const wrapper = new ManifestWrapper(child, this.wallet, this.locator)
        const subNodes = await wrapper.loadNodes(node)
        for (const subNode of subNodes) {
          node.attach(subNode.address, true)
        }
      }),
    )

    return node
  }

  /**
   * Load the nodes that are defined in the wrapped manifest and optionally attach them to a node
   */
  async loadNodes(
    /** Node to optionally attach the loaded nodes to */
    node?: MemoryNode,
    /** Additional creatable modules */
    additionalCreatableModules?: CreatableModuleRegistry,
  ): Promise<MemoryNode[]>
  async loadNodes(
    /** Node to optionally attach the loaded nodes to */
    node?: MemoryNode,
    /** Additional creatable modules */
    additionalCreatableModules?: CreatableModuleDictionary,
  ): Promise<MemoryNode[]>
  async loadNodes(node?: MemoryNode, additionalCreatableModules?: CreatableModuleDictionary | CreatableModuleRegistry): Promise<MemoryNode[]> {
    const registry = toCreatableModuleRegistry(additionalCreatableModules ?? {})
    const result = await Promise.all(
      this.jsonPayload().nodes?.map(async (nodeManifest, index) => {
        const subNode = await this.loadNodeFromManifest(nodeManifest, nodeManifest.config.accountPath ?? `${index}'`, registry)
        await node?.register(subNode)
        return subNode
      }),
    )
    return result
  }

  nodeManifest(index: number) {
    return this.jsonPayload().nodes?.[index]
  }

  /** Register a module on a node based on a manifest */
  private async registerModule(node: MemoryNode, manifest: ModuleManifest, creatableModules?: CreatableModuleRegistry): Promise<ModuleInstance>
  private async registerModule(node: MemoryNode, manifest: ModuleManifest, creatableModules?: CreatableModuleDictionary): Promise<ModuleInstance>
  private async registerModule(
    node: MemoryNode,
    manifest: ModuleManifest,
    creatableModules?: CreatableModuleDictionary | CreatableModuleRegistry,
  ): Promise<ModuleInstance> {
    const registry = toCreatableModuleRegistry(creatableModules ?? {})
    const creatableModule = new ModuleFactoryLocator(this.locator.registry)
      .registerMany(registry)
      .locate(manifest.config.schema, manifest.config.labels)
    const path = manifest.config.accountPath
    const wallet = path ? await this.wallet.derivePath(path) : undefined
    const account = path ? undefined : Account.randomSync()
    const module = await creatableModule.create({
      account,
      config: assertEx(manifest.config, 'Missing config'),
      wallet,
    })
    await node.register(module)
    return module
  }
}
