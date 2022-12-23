import { XyoApiConfig } from '@xyo-network/api-models'
import { ModuleParams } from '@xyo-network/module'
import { Module, ModuleFilter } from '@xyo-network/module-model'
import { AbstractNode, NodeConfig } from '@xyo-network/node'

import { RemoteModuleResolver } from '../RemoteModuleResolver'

export class RemoteNode<TConfig extends NodeConfig = NodeConfig> extends AbstractNode<TConfig> {
  constructor(params: ModuleParams<TConfig>, protected readonly apiConfig: XyoApiConfig) {
    super(params, new RemoteModuleResolver(apiConfig))
  }

  static override async create(params?: Partial<ModuleParams<NodeConfig>>): Promise<RemoteNode> {
    return (await super.create(params)) as RemoteNode
  }

  // TODO: Create and create remote module for node to issue queries against
  attach(address: string): void {
    throw new Error('Method not implemented.')
  }
  detach(address: string): void {
    throw new Error('Method not implemented.')
  }
  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    return await this.internalResolver.resolve(filter)
  }
  async tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    return await this.internalResolver.tryResolve(filter)
  }
}
