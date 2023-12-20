import { Promisable } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { InstanceTypeCheck, ModuleInstance, ModuleManifestQuery, ModuleManifestQuerySchema } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import {
  isNodeInstance,
  isNodeModule,
  NodeAttachedQuery,
  NodeAttachedQuerySchema,
  NodeAttachQuery,
  NodeAttachQuerySchema,
  NodeDetachQuery,
  NodeDetachQuerySchema,
  NodeInstance,
  NodeModule,
  NodeRegisteredQuery,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

constructableModuleWrapper()
export class NodeWrapper<TWrappedModule extends NodeModule = NodeModule>
  extends ModuleWrapper<TWrappedModule>
  implements NodeInstance<TWrappedModule['params']>
{
  static override instanceIdentityCheck: InstanceTypeCheck<NodeInstance> = isNodeInstance
  static override moduleIdentityCheck = isNodeModule
  static override requiredQueries = [NodeAttachQuerySchema, ...ModuleWrapper.requiredQueries]

  async attach(nameOrAddress: string, external?: boolean): Promise<string | undefined> {
    const queryPayload: NodeAttachQuery = { external, nameOrAddress, schema: NodeAttachQuerySchema }
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  async attached(): Promise<string[]> {
    const queryPayload: NodeAttachedQuery = { schema: NodeAttachedQuerySchema }
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async detach(nameOrAddress: string): Promise<string | undefined> {
    const queryPayload: NodeDetachQuery = { nameOrAddress, schema: NodeDetachQuerySchema }
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  override async manifest(maxDepth?: number): Promise<NodeManifestPayload> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth ? { maxDepth } : {}) }
    const payloads: NodeManifestPayload[] = (await this.sendQuery(queryPayload)).filter(
      isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema),
    )
    return payloads.pop() as NodeManifestPayload
  }

  register(_module: ModuleInstance) {
    throw new Error('Not implemented')
  }

  async registered(): Promise<string[]> {
    const queryPayload: NodeRegisteredQuery = { schema: NodeRegisteredQuerySchema }
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  registeredModules(): Promisable<ModuleInstance[]> {
    throw new Error('Not implemented')
  }
}
