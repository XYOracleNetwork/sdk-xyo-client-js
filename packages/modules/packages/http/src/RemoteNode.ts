import { Module, ModuleFilter } from '@xyo-network/module-model'
import { AbstractNode } from '@xyo-network/node'

export class RemoteNode extends AbstractNode {
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
  tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    return this.internalResolver.tryResolve(filter)
  }
}
