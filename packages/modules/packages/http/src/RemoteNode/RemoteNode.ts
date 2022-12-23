import { XyoApiConfig } from '@xyo-network/api-models'
import { ModuleParams } from '@xyo-network/module'
import {
  AbstractModuleConfigSchema,
  AbstractModuleDiscoverQuerySchema,
  AbstractModuleSubscribeQuerySchema,
  Module,
  ModuleDescription,
  ModuleFilter,
  ModuleQueryResult,
  XyoQueryBoundWitness,
} from '@xyo-network/module-model'
import {
  NodeConfig,
  NodeModule,
  XyoNodeAttachedQuerySchema,
  XyoNodeAttachQuerySchema,
  XyoNodeDetachQuerySchema,
  XyoNodeRegisteredQuerySchema,
} from '@xyo-network/node'
import { PayloadFields, SchemaFields, XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { HttpProxyModule } from '../HttpProxyModule'
import { RemoteModuleResolver } from '../RemoteModuleResolver'

export interface RemoteNodeModuleParams<TConfig extends NodeConfig = NodeConfig> extends ModuleParams<TConfig> {
  // address?: string
  apiConfig: XyoApiConfig
}

export class RemoteNode<TConfig extends NodeConfig = NodeConfig> implements NodeModule {
  protected readonly apiConfig: XyoApiConfig
  protected readonly internalResolver: RemoteModuleResolver

  constructor(params: RemoteNodeModuleParams<TConfig>, protected readonly module: HttpProxyModule) {
    this.apiConfig = params.apiConfig
    this.internalResolver = new RemoteModuleResolver(params.apiConfig)
  }
  get address(): string {
    return this.module.address
  }
  get config() {
    return this.module.config
  }

  get isModuleResolver(): boolean {
    return true
  }

  static async create(params: RemoteNodeModuleParams<NodeConfig>): Promise<RemoteNode> {
    const module = await HttpProxyModule.create({ apiConfig: params.apiConfig, config: { schema: AbstractModuleConfigSchema } })
    return new this(params, module)
  }

  attach(_address: string): void {
    throw new Error('Method not implemented.')
  }
  attached(): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  description(): Promise<ModuleDescription> {
    return this.module.description()
  }
  detach(_address: string): void {
    throw new Error('Method not implemented.')
  }
  queries(): string[] {
    return this.module.queries()
  }
  query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    return this.module.query(query, payloads)
  }
  public queryable(schema: string, _addresses?: string[] | undefined) {
    return this.module.queryable(schema)
  }
  register(_module: Module): void {
    throw new Error('Method not implemented.')
  }
  registered(): string[] {
    throw new Error('Method not implemented.')
  }
  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    return await this.internalResolver.resolve(filter)
  }
  async tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    return await this.internalResolver.tryResolve(filter)
  }
}
