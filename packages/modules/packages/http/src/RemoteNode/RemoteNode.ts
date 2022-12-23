import { XyoApiConfig } from '@xyo-network/api-models'
import { ModuleParams } from '@xyo-network/module'
import {
  AbstractModuleConfigSchema,
  Module,
  ModuleDescription,
  ModuleFilter,
  ModuleQueryResult,
  XyoQueryBoundWitness,
} from '@xyo-network/module-model'
import { AbstractNode, NodeConfig, NodeConfigSchema, NodeModule, NodeWrapper } from '@xyo-network/node'
import { XyoPayload } from '@xyo-network/payload-model'

import { HttpProxyModule } from '../HttpProxyModule'
import { RemoteModuleResolver } from '../RemoteModuleResolver'

export interface RemoteNodeModuleParams<TConfig extends NodeConfig = NodeConfig> extends ModuleParams<TConfig> {
  // address?: string
  apiConfig: XyoApiConfig
}

export class RemoteNode<TConfig extends NodeConfig = NodeConfig> extends AbstractNode {
  static readonly configSchema = NodeConfigSchema

  protected readonly apiConfig: XyoApiConfig
  protected readonly internalResolver: RemoteModuleResolver

  private _node: NodeWrapper | undefined

  constructor(params: RemoteNodeModuleParams<TConfig>, protected readonly module: HttpProxyModule) {
    super(params)
    this.apiConfig = params.apiConfig
    this.internalResolver = new RemoteModuleResolver(params.apiConfig)
  }

  override get address(): string {
    return this.module.address
  }

  public get node(): NodeWrapper {
    if (this._node) return this._node
    else {
      this._node = new NodeWrapper(this.module as unknown as NodeModule)
      return this.node
    }
  }

  static override async create(params: RemoteNodeModuleParams<NodeConfig>): Promise<RemoteNode> {
    const module = await HttpProxyModule.create({ apiConfig: params.apiConfig, config: { schema: AbstractModuleConfigSchema } })
    return new this(params, module)
  }

  override attach(address: string): Promise<void> {
    return this.node.attach(address)
  }
  override attached(): Promise<string[]> {
    return this.node.attached()
  }
  override async description(): Promise<ModuleDescription> {
    return await this.node.description()
  }
  override detach(address: string): Promise<void> {
    return this.node.detach(address)
  }
  override queries(): string[] {
    return this.node.queries()
  }
  override query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    return this.node.query(query, payloads)
  }
  override queryable(schema: string, _addresses?: string[] | undefined) {
    return this.node.queryable(schema)
  }
  override register(_module: Module): void {
    throw new Error('Method not implemented.')
  }
  override registered(): Promise<string[]> {
    return this.node.registered()
  }
  override async registeredModules(): Promise<Module[]> {
    const addresses = await this.registered()
    const resolved = await Promise.all(
      addresses.map((address) => {
        return this.tryResolve({ address: [address] })
      }),
    )
    return resolved.flatMap((mod) => mod)
  }
  override resolve(filter?: ModuleFilter): Promise<Module[]> {
    return this.internalResolver.resolve(filter)
  }
  override tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    return this.internalResolver.tryResolve(filter)
  }
}
