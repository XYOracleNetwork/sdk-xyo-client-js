import { assertEx } from '@xylabs/assert'
import { ModuleFilter, XyoModule, XyoModuleParams } from '@xyo-network/module'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'

import { NodeConfig } from './Config'
import { XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema } from './Queries'
import { XyoNode } from './XyoNode'

export class MemoryNode<TConfig extends NodeConfig = NodeConfig, TModule extends XyoModule = XyoModule> extends XyoNode<TConfig, TModule> {
  private registeredModuleMap = new Map<string, TModule>()

  static override async create(params?: XyoModuleParams<NodeConfig>): Promise<MemoryNode> {
    return (await super.create(params)) as MemoryNode
  }

  override attach(address: string) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')
    this.internalResolver.add(module)
  }

  override detach(address: string) {
    this.internalResolver.remove(address)
  }

  public override queries(): string[] {
    return [XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema, ...super.queries()]
  }

  override register(module: TModule) {
    module.resolver = this.internalResolver
    this.registeredModuleMap.set(module.address, module)
  }

  override registered() {
    return Array.from(this.registeredModuleMap.keys()).map((key) => {
      return key
    })
  }

  override registeredModules() {
    return Array.from(this.registeredModuleMap.values()).map((value) => {
      return value
    })
  }

  override async resolve(filter: ModuleFilter): Promise<TModule[]> {
    const attachedModules = await this.attachedModules()
    const filteredByConfigSchema =
      compact(
        flatten(
          filter.config?.map((schema) => {
            return attachedModules.filter((module) => module.config.schema === schema)
          }),
        ),
      ) ?? this.attachedModules()

    return compact(
      filteredByConfigSchema.filter((module) =>
        filter.query?.map((queryList) => {
          return queryList.reduce((supported, query) => {
            return supported && module.queryable(query)
          }, true)
        }),
      ),
    )
  }

  override unregister(module: TModule) {
    this.registeredModuleMap.delete(module.address)
  }
}
