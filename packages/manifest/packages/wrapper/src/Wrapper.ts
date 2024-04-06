import { assertEx } from '@xylabs/assert'
import { BaseParams } from '@xylabs/object'
import { HDWallet } from '@xyo-network/account'
import { ModuleManifest, NodeManifest, PackageManifestPayload } from '@xyo-network/manifest-model'
import {
  assignCreatableModuleRegistry,
  CreatableModuleDictionary,
  CreatableModuleRegistry,
  isModuleName,
  ModuleFactoryLocator,
  ModuleIdentifierTransformer,
  ModuleInstance,
  ModuleParams,
  toCreatableModuleRegistry,
} from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeInstance } from '@xyo-network/node-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { WalletInstance } from '@xyo-network/wallet-model'

import { standardCreatableModules } from './standardCreatableModules'

export interface ManifestWrapperParams extends BaseParams {
  readonly locator?: ModuleFactoryLocator
  readonly moduleIdentifierTransformers?: ModuleIdentifierTransformer[]
  readonly privateChildren?: PackageManifestPayload[]
  readonly publicChildren?: PackageManifestPayload[]
  readonly wallet: WalletInstance
}

/** Provides functionality that can be performed on a PackageManifest */
export class ManifestWrapperBase extends PayloadWrapper<PackageManifestPayload> {
  constructor(payload: PackageManifestPayload, params?: ManifestWrapperParams) {
    super(payload, params)
  }

  get wallet() {
    return this.params?.wallet
  }

  async loadModule(
    wallet: WalletInstance,
    node: MemoryNode,
    manifest: ModuleManifest,
    external: boolean,
    additionalCreatableModules?: CreatableModuleRegistry,
  ): Promise<void>
  async loadModule(
    wallet: WalletInstance,
    node: MemoryNode,
    manifest: ModuleManifest,
    external: boolean,
    additionalCreatableModules?: CreatableModuleDictionary,
  ): Promise<void>
  async loadModule(
    wallet: WalletInstance,
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

    assertEx(isModuleName(manifest.config.name), () => `Invalid Module Name: ${manifest.config.name}`)

    assertEx(!(await collision(node, manifest.config.name, external)), () => `Node name collision [${manifest.config.name}]`)

    if (!(await collision(node, manifest.config.name, external))) {
      //is it already registered?
      if (node.registeredModules().some((mod) => mod.config.name && mod.config.name === manifest.config.name)) {
        assertEx(await node.attach(manifest.config.name, external), () => `Failed to attach module [${manifest.config.name}]`)
      } else {
        assertEx(
          await node.attach((await this.registerModule(wallet, node, manifest, creatableModules)).address, external),
          () => `No module with config schema [${manifest.config.name}] registered`,
        )
      }
    }
  }

  //These are top level, so they can use this.wallet as their
  async loadNodeFromIndex(index: number, additionalCreatableModules?: CreatableModuleRegistry): Promise<MemoryNode>
  async loadNodeFromIndex(index: number, additionalCreatableModules?: CreatableModuleDictionary): Promise<MemoryNode>
  async loadNodeFromIndex(index: number, additionalCreatableModules?: CreatableModuleDictionary | CreatableModuleRegistry): Promise<MemoryNode> {
    const manifest = assertEx(this.nodeManifest(index), () => 'Failed to find Node Manifest')
    const registry = toCreatableModuleRegistry(additionalCreatableModules ?? {})
    return await this.loadNodeFromManifest(this.wallet, manifest, manifest.config.accountPath ?? `${index}'`, registry)
  }

  async loadNodeFromManifest(
    wallet: WalletInstance,
    manifest: NodeManifest,
    path: string,
    additionalCreatableModules?: CreatableModuleRegistry,
  ): Promise<MemoryNode>
  async loadNodeFromManifest(
    wallet: WalletInstance,
    manifest: NodeManifest,
    path: string,
    additionalCreatableModules?: CreatableModuleDictionary,
  ): Promise<MemoryNode>
  async loadNodeFromManifest(
    wallet: WalletInstance,
    manifest: NodeManifest,
    path?: string,
    additionalCreatableModules?: CreatableModuleDictionary | CreatableModuleRegistry,
  ): Promise<MemoryNode> {
    const derivedWallet = path ? await wallet.derivePath(path) : await HDWallet.random()
    const node = await MemoryNode.create({ account: derivedWallet, config: manifest.config })
    const registry = toCreatableModuleRegistry(additionalCreatableModules ?? {})
    // Load Private Modules
    const privateModules =
      manifest.modules?.private?.map(async (moduleManifest) => {
        await this.loadModule(derivedWallet, node, moduleManifest, false, registry)
      }) ?? []
    // Load Public Modules
    const publicModules =
      manifest.modules?.public?.map(async (moduleManifest) => {
        await this.loadModule(derivedWallet, node, moduleManifest, true, registry)
      }) ?? []
    await Promise.all([...privateModules, ...publicModules])

    await Promise.all(
      this.privateChildren.map(async (child) => {
        const wrapper = new ManifestWrapper(child, derivedWallet, this.locator)
        const subNodes = await wrapper.loadNodes(node)
        await Promise.all(
          subNodes.map((subNode) => {
            return node.attach(subNode.address, false)
          }),
        )
      }),
    )

    await Promise.all(
      this.publicChildren.map(async (child) => {
        const wrapper = new ManifestWrapper(child, derivedWallet, this.locator)
        const subNodes = await wrapper.loadNodes(node)
        await Promise.all(
          subNodes.map((subNode) => {
            return node.attach(subNode.address, true)
          }),
        )
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
      this.payload.nodes?.map(async (nodeManifest, index) => {
        const subNode = await this.loadNodeFromManifest(this.wallet, nodeManifest, nodeManifest.config.accountPath ?? `${index}'`, registry)
        await node?.register(subNode)
        return subNode
      }),
    )
    return result
  }

  nodeManifest(index: number) {
    return this.payload.nodes?.[index]
  }

  /** Register a module on a node based on a manifest */
  private async registerModule(
    wallet: WalletInstance,
    node: MemoryNode,
    manifest: ModuleManifest,
    creatableModules?: CreatableModuleRegistry,
  ): Promise<ModuleInstance>
  private async registerModule(
    wallet: WalletInstance,
    node: MemoryNode,
    manifest: ModuleManifest,
    creatableModules?: CreatableModuleDictionary,
  ): Promise<ModuleInstance>
  private async registerModule(
    wallet: WalletInstance,
    node: MemoryNode,
    manifest: ModuleManifest,
    creatableModules?: CreatableModuleDictionary | CreatableModuleRegistry,
  ): Promise<ModuleInstance> {
    const registry = toCreatableModuleRegistry(creatableModules ?? {})
    const creatableModule = new ModuleFactoryLocator(this.locator.registry)
      .registerMany(registry)
      .locate(manifest.config.schema, manifest.config.labels)
    const path = manifest.config.accountPath
    const account = path ? await wallet.derivePath(path) : 'random'
    const params: ModuleParams = {
      account,
      config: assertEx(manifest.config, () => 'Missing config'),
    }
    if (this.moduleIdentifierTransformers) {
      params.moduleIdentifierTransformers = this.moduleIdentifierTransformers
    }
    const module = await creatableModule.create(params)
    await node.register(module)
    return module
  }
}

export class ManifestWrapper extends ManifestWrapperBase {
  constructor(
    payload: PackageManifestPayload,
    protected readonly wallet: WalletInstance,
    protected readonly locator: ModuleFactoryLocator = new ModuleFactoryLocator({}),
    protected readonly publicChildren: PackageManifestPayload[] = [],
    protected readonly privateChildren: PackageManifestPayload[] = [],
    protected readonly moduleIdentifierTransformers: ModuleIdentifierTransformer[],
  ) {
    const params: ManifestWrapperParams = { locator, moduleIdentifierTransformers, privateChildren, publicChildren, wallet }
    super(payload, params)
  }
}
