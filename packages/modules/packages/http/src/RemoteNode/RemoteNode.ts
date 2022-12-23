import { XyoApiConfig } from '@xyo-network/api-models'
import { ModuleParams } from '@xyo-network/module'
import { Module, ModuleFilter } from '@xyo-network/module-model'
import { AbstractNode, NodeConfig } from '@xyo-network/node'

import { RemoteModuleResolver } from '../RemoteModuleResolver'

export interface RemoteNodeModuleParams<TConfig extends NodeConfig = NodeConfig> extends ModuleParams<TConfig> {
  // address?: string
  apiConfig: XyoApiConfig
}

// TODO: Don't inherit from AbstractNode but rather implement NodeModule
// TODO: Create remote module for node to issue queries against
export class RemoteNode<TConfig extends NodeConfig = NodeConfig> extends AbstractNode<TConfig> {
  protected readonly apiConfig: XyoApiConfig

  constructor(params: RemoteNodeModuleParams<TConfig>) {
    super(params, new RemoteModuleResolver(params.apiConfig))
    this.apiConfig = params.apiConfig
  }

  static override async create(params: RemoteNodeModuleParams<NodeConfig>): Promise<RemoteNode> {
    return (await super.create(params)) as RemoteNode
  }

  attach(_address: string): void {
    throw new Error('Method not implemented.')
  }
  detach(_address: string): void {
    throw new Error('Method not implemented.')
  }
  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    return await this.internalResolver.resolve(filter)
  }
  async tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    return await this.internalResolver.tryResolve(filter)
  }
}
