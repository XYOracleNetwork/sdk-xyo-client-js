import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import {
  ModuleManifest, NodeManifest, PackageManifestPayload,
} from '@xyo-network/manifest-model'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import {
  isModuleName,
  ModuleIdentifierTransformer, ModuleInstance, ModuleParams,
} from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeInstance } from '@xyo-network/node-model'
import { WithAnySchema } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { WalletInstance } from '@xyo-network/wallet-model'

/** Provides functionality that can be performed on a PackageManifest */
export class ManifestWrapper<TManifest extends WithAnySchema<PackageManifestPayload> | void = void> extends PayloadWrapper<
  TManifest extends WithAnySchema<PackageManifestPayload> ? TManifest : WithAnySchema<PackageManifestPayload>
> {
  constructor(
    payload: TManifest extends WithAnySchema<PackageManifestPayload> ? TManifest : WithAnySchema<PackageManifestPayload>,
    protected readonly wallet: WalletInstance,
    protected readonly locator: ModuleFactoryLocator = new ModuleFactoryLocator(),
    protected readonly publicChildren: ModuleManifest[] = [],
    protected readonly privateChildren: ModuleManifest[] = [],
    protected readonly moduleIdentifierTransformers?: ModuleIdentifierTransformer[],
  ) {
    super(payload)
  }

  async loadModule(wallet: WalletInstance, node: MemoryNode, manifest: ModuleManifest, external = true): Promise<void> {
    console.log('loadModule', manifest.config.name)
    const collision = async (node: NodeInstance, name: string, external: boolean) => {
      const externalConflict = external ? (await node.resolve(name, { direction: external ? 'all' : 'down' })) !== undefined : false
      return externalConflict || (await node.resolve(name, { direction: 'down' })) !== undefined
    }

    assertEx(isModuleName(manifest.config.name), () => `Invalid Module Name: ${manifest.config.name}`)
    assertEx(!(await collision(node, manifest.config.name, external)), () => `Node name collision [${manifest.config.name}]`)

    if (!(await collision(node, manifest.config.name, external))) {
      // is it already registered?
      if (node.registeredModules().some(mod => mod.config.name && mod.config.name === manifest.config.name)) {
        assertEx(await node.attach(manifest.config.name, external), () => `Failed to attach module [${manifest.config.name}]`)
      } else {
        if ((manifest as NodeManifest).modules) {
          const childNode = await this.loadNodeFromManifest(wallet, manifest as NodeManifest, manifest.config.accountPath, false)
          await node.register(childNode)
          await node.attach(childNode.address, external)
        } else {
          assertEx(
            await node.attach((await this.registerModule(wallet, node, manifest)).address, external),
            () => `No module with config schema [${manifest.config.name}] registered`,
          )
        }
      }
    }
  }

  // These are top level, so they can use this.wallet as their
  async loadNodeFromIndex(index: number): Promise<MemoryNode> {
    const manifest = assertEx(this.nodeManifest(index), () => 'Failed to find Node Manifest')
    return await this.loadNodeFromManifest(this.wallet, manifest, manifest.config.accountPath ?? `${index}'`)
  }

  async loadNodeFromManifest(wallet: WalletInstance, manifest: NodeManifest, path?: string, loadConfigChildren = false): Promise<MemoryNode> {
    console.log('loadNodeFromManifest', manifest.config.name)
    const derivedWallet = path ? await wallet.derivePath(path) : await HDWallet.random()
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

    if (loadConfigChildren) {
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
    }

    return node
  }

  /**
   * Load the nodes that are defined in the wrapped manifest and optionally attach them to a node
   */
  async loadNodes(node?: MemoryNode): Promise<MemoryNode[]> {
    return await Promise.all(
      this.payload.nodes?.map(async (nodeManifest, index) => {
        const subNode = await this.loadNodeFromManifest(this.wallet, nodeManifest, nodeManifest.config.accountPath ?? `${index}'`, index === 0)
        await node?.register(subNode)
        return subNode
      }),
    )
  }

  nodeManifest(index: number) {
    return this.payload.nodes?.[index]
  }

  /** Register a module on a node based on a manifest */
  private async registerModule(wallet: WalletInstance, node: MemoryNode, manifest: ModuleManifest): Promise<ModuleInstance> {
    const creatableModule = this.locator.locate(manifest.config.schema, manifest.config.labels)
    const path = manifest.config.accountPath
    const account = path ? await wallet.derivePath(path) : 'random'
    const params: ModuleParams = {
      account,
      config: assertEx(manifest.config, () => 'Missing config'),
    }
    if (this.moduleIdentifierTransformers) {
      params.moduleIdentifierTransformers = this.moduleIdentifierTransformers
    }
    const mod = await creatableModule.create(params)
    await node.register(mod)
    return mod
  }
}
