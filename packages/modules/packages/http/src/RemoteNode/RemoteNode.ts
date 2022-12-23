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
import { AbstractNode, NodeConfig, NodeConfigSchema } from '@xyo-network/node'
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

  constructor(params: RemoteNodeModuleParams<TConfig>, protected readonly module: HttpProxyModule) {
    super(params)
    this.apiConfig = params.apiConfig
    this.internalResolver = new RemoteModuleResolver(params.apiConfig)
  }

  override get address(): string {
    return this.module.address
  }

  static override async create(params: RemoteNodeModuleParams<NodeConfig>): Promise<RemoteNode> {
    const module = await HttpProxyModule.create({ apiConfig: params.apiConfig, config: { schema: AbstractModuleConfigSchema } })
    return new this(params, module)
  }

  override attach(_address: string): void {
    throw new Error('Method not implemented.')
  }
  override attached(): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  override description(): Promise<ModuleDescription> {
    return this.module.description()
  }
  override detach(_address: string): void {
    throw new Error('Method not implemented.')
  }
  override queries(): string[] {
    return this.module.queries()
  }
  override query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    return this.module.query(query, payloads)
  }
  override queryable(schema: string, _addresses?: string[] | undefined) {
    return this.module.queryable(schema)
  }
  override register(_module: Module): void {
    throw new Error('Method not implemented.')
  }
  override registered(): string[] {
    throw new Error('Method not implemented.')
  }
  override resolve(filter?: ModuleFilter): Promise<Module[]> {
    return this.internalResolver.resolve(filter)
  }
  override tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    return this.internalResolver.tryResolve(filter)
  }
}
