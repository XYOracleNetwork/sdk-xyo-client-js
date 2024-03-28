import { Address } from '@xylabs/hex'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { InstanceTypeCheck, ModuleIdentifier, ModuleManifestQuery, ModuleManifestQuerySchema } from '@xyo-network/module-model'
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
import { isPayloadOfSchemaType, WithMeta } from '@xyo-network/payload-model'

constructableModuleWrapper()
export class NodeWrapper<TWrappedModule extends NodeModule = NodeModule>
  extends ModuleWrapper<TWrappedModule>
  implements NodeInstance<TWrappedModule['params']>
{
  static override instanceIdentityCheck: InstanceTypeCheck<NodeInstance> = isNodeInstance
  static override moduleIdentityCheck = isNodeModule
  static override requiredQueries = [
    NodeAttachedQuerySchema,
    NodeAttachQuerySchema,
    NodeDetachQuerySchema,
    NodeRegisteredQuerySchema,
    ...ModuleWrapper.requiredQueries,
  ]

  async attach(nameOrAddress: ModuleIdentifier, external?: boolean): Promise<Address | undefined> {
    const queryPayload: NodeAttachQuery = { external, nameOrAddress, schema: NodeAttachQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<AddressPayload>>(AddressSchema))
    return payloads.pop()?.address
  }

  async attached(): Promise<Address[]> {
    const queryPayload: NodeAttachedQuery = { schema: NodeAttachedQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<AddressPayload>>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async detach(nameOrAddress: ModuleIdentifier): Promise<Address | undefined> {
    const queryPayload: NodeDetachQuery = { nameOrAddress, schema: NodeDetachQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<AddressPayload>>(AddressSchema))
    return payloads.pop()?.address
  }

  override async manifest(maxDepth?: number): Promise<NodeManifestPayload> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth ? { maxDepth } : {}) }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<NodeManifestPayload>>(NodeManifestPayloadSchema))
    return payloads.pop() as NodeManifestPayload
  }

  async registered(): Promise<Address[]> {
    const queryPayload: NodeRegisteredQuery = { schema: NodeRegisteredQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<AddressPayload>>(AddressSchema))
    return payloads.map((p) => p.address)
  }
}
