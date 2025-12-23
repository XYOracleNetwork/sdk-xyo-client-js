import type { CreatableName } from '@xylabs/sdk-js'
import {
  assertEx, isArray, isString,
} from '@xylabs/sdk-js'
import type {
  ModuleManifest, NodeManifest, PackageManifestPayload,
} from '@xyo-network/manifest-model'
import type {
  ModuleFactoryLocatorInstance,
  ModuleIdentifierTransformer, ModuleInstance, ModuleParams,
} from '@xyo-network/module-model'
import { isModuleName } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import type { NodeInstance } from '@xyo-network/node-model'
import type { WithAnySchema } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { HDWallet } from '@xyo-network/wallet'
import type { WalletInstance } from '@xyo-network/wallet-model'

export interface ManifestWrapperExParams {
  locator: ModuleFactoryLocatorInstance
  moduleIdentifierTransformers?: ModuleIdentifierTransformer[]
  privateChildren?: ModuleManifest[]
  publicChildren?: ModuleManifest[]
  wallet: WalletInstance
}

/** Provides functionality that can be performed on a PackageManifest */
export class ManifestWrapperEx<
  TManifest extends WithAnySchema<PackageManifestPayload> | void,
  TParams extends ManifestWrapperExParams = ManifestWrapperExParams,
> extends PayloadWrapper<TManifest extends WithAnySchema<PackageManifestPayload> ? TManifest : WithAnySchema<PackageManifestPayload>> {
  protected params: TParams
  constructor(
    payload: TManifest extends WithAnySchema<PackageManifestPayload> ? TManifest : WithAnySchema<PackageManifestPayload>,
    params: TParams,
  ) {
    super(payload)
    this.params = params
  }

  get locator() {
    return this.params.locator
  }

  get moduleIdentifierTransformers() {
    return this.params.moduleIdentifierTransformers ?? []
  }

  get privateChildren() {
    return this.params.privateChildren ?? []
  }

  get publicChildren() {
    return this.params.publicChildren ?? []
  }

  get wallet() {
    return this.params.wallet
  }

  async loadModule(wallet: WalletInstance, node: MemoryNode, manifest: ModuleManifest, external = true): Promise<void> {
    const collision = async (node: NodeInstance, name: string, external: boolean) => {
      const externalConflict = external ? (await node.resolve(name, { direction: external ? 'all' : 'down' })) !== undefined : false
      return externalConflict || (await node.resolve(name, { direction: 'down' })) !== undefined
    }

    assertEx(isModuleName(manifest.config.name), () => `Invalid Module Name: ${manifest.config.name}`)
    assertEx(!(await collision(node, manifest.config.name, external)), () => `Node name collision [${manifest.config.name}]`)

    if (!(await collision(node, manifest.config.name, external))) {
      // is it already registered?
      if (node.registeredModules().some(mod => isString(mod.config.name) && mod.config.name === manifest.config.name)) {
        assertEx(await node.attach(manifest.config.name, external), () => `Failed to attach module [${manifest.config.name}]`)
      } else {
        assertEx(
          await node.attach((await this.registerModule(wallet, node, manifest)).address, external),
          () => `No module with config schema [${manifest.config.name}] registered`,
        )
      }
    }
  }

  // These are top level, so they can use this.wallet as their
  async loadNodeFromIndex(index: number): Promise<MemoryNode> {
    const manifest = assertEx(this.nodeManifest(index), () => 'Failed to find Node Manifest') as NodeManifest
    return await this.loadNodeFromManifest(this.wallet, manifest, manifest.config.accountPath ?? `${index}'`)
  }

  async loadNodeFromManifest(wallet: WalletInstance, manifest: NodeManifest, path?: string): Promise<MemoryNode> {
    const derivedWallet = isString(path) ? await wallet.derivePath(path) : await HDWallet.random()
    const node = await MemoryNode.create({ account: derivedWallet, config: manifest.config })
    // Load Private Modules
    const privateModules
      = manifest.modules?.private?.map(async (moduleManifest) => {
        if (typeof moduleManifest === 'object') {
          await this.loadModule(derivedWallet, node, moduleManifest, false)
        }
      }) ?? []
    // Load Public Modules
    const publicModules
      = manifest.modules?.public?.map(async (moduleManifest) => {
        if (typeof moduleManifest === 'object') {
          await this.loadModule(derivedWallet, node, moduleManifest, true)
        }
      }) ?? []
    await Promise.all([...privateModules, ...publicModules])

    await Promise.all(
      this.privateChildren.map(async (moduleManifest) => {
        if (typeof moduleManifest === 'object') {
          await this.loadModule(derivedWallet, node, moduleManifest, false)
        }
      }),
    )

    await Promise.all(
      this.publicChildren.map(async (moduleManifest) => {
        if (typeof moduleManifest === 'object') {
          await this.loadModule(derivedWallet, node, moduleManifest, true)
        }
      }),
    )

    return node
  }

  /**
   * Load the nodes that are defined in the wrapped manifest and optionally attach them to a node
   */
  async loadNodes(node?: MemoryNode): Promise<MemoryNode[]> {
    return await Promise.all(
      this.payload.nodes?.map(async (nodeManifest, index) => {
        const subNode = await this.loadNodeFromManifest(this.wallet, nodeManifest as NodeManifest, nodeManifest.config.accountPath ?? `${index}'`)
        await node?.register(subNode)
        return subNode
      }),
    )
  }

  nodeManifest(index: number): NodeManifest | undefined {
    return this.payload.nodes?.[index] as NodeManifest | undefined
  }

  /** Register a module on a node based on a manifest */
  private async registerModule(wallet: WalletInstance, node: MemoryNode, manifest: ModuleManifest): Promise<ModuleInstance> {
    const creatableModule = this.locator.locate(manifest.config.schema, manifest.config.labels)
    const path = manifest.config.accountPath
    const account = isString(path) ? await wallet.derivePath(path) : 'random'
    const params: ModuleParams = {
      name: manifest.config.name as CreatableName,
      account,
      config: assertEx(manifest.config, () => 'Missing config'),
    }
    if (isArray(this.moduleIdentifierTransformers)) {
      params.moduleIdentifierTransformers = this.moduleIdentifierTransformers
    }
    const mod = await creatableModule.create(params)
    await node.register(mod)
    return mod
  }
}
