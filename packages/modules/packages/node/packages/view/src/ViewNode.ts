import { AnyConfigSchema, ModuleIdentifier } from '@xyo-network/module-model'
import { MemoryNode, NodeHelper } from '@xyo-network/node-memory'
import { asNodeInstance, AttachableNodeInstance, NodeConfig, NodeModuleEventData, NodeParams } from '@xyo-network/node-model'

export const ViewNodeConfigSchema = 'network.xyo.node.view.config'
export type ViewNodeConfigSchema = typeof ViewNodeConfigSchema

export type ViewNodeConfig = NodeConfig<
  {
    ids: ModuleIdentifier[]
    source: ModuleIdentifier
  },
  ViewNodeConfigSchema
>

export type ViewNodeParams = NodeParams<AnyConfigSchema<ViewNodeConfig>>

export class ViewNode<TParams extends ViewNodeParams = ViewNodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends MemoryNode<TParams, TEventData>
  implements AttachableNodeInstance
{
  static override configSchemas = [ViewNodeConfigSchema]

  get ids() {
    return this.config.ids
  }

  get source() {
    return this.config.source
  }

  async build() {
    const source = asNodeInstance(await this.resolve(this.source))
    if (source) {
      await Promise.all(
        this.ids.map(async (id) => {
          await NodeHelper.attachToExistingNode(source, id, this)
        }),
      )
    }
  }

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    await this.build()
    return true
  }
}
