import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  InstanceTypeCheck,
  ModuleIdentifier,
  ModuleInstance,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import {
  ChildCertification,
  ChildCertificationFields,
  ChildCertificationSchema,
  isNodeInstance,
  isNodeModule,
  NodeAttachedQuery,
  NodeAttachedQuerySchema,
  NodeAttachQuery,
  NodeAttachQuerySchema,
  NodeCertifyQuery,
  NodeCertifyQuerySchema,
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
  static override requiredQueries = [NodeAttachQuerySchema, ...ModuleWrapper.requiredQueries]

  async attach(id: ModuleIdentifier, external?: boolean): Promise<Address | undefined> {
    const queryPayload: NodeAttachQuery = { external, id, schema: NodeAttachQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<AddressPayload>>(AddressSchema))
    return payloads.pop()?.address
  }

  async attachQuery(id: ModuleIdentifier, external?: boolean, account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    const queryPayload: NodeAttachQuery = { external, id, schema: NodeAttachQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  async attached(): Promise<Address[]> {
    const queryPayload: NodeAttachedQuery = { schema: NodeAttachedQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<AddressPayload>>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async attachedQuery(account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    const queryPayload: NodeAttachedQuery = { schema: NodeAttachedQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  async certify(id: ModuleIdentifier): Promise<ChildCertificationFields | undefined> {
    const queryPayload: NodeCertifyQuery = { id, schema: NodeCertifyQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<ChildCertification>>(ChildCertificationSchema))
    return payloads.pop()
  }

  async certifyQuery(id: ModuleIdentifier, account?: AccountInstance): Promise<ModuleQueryResult<ChildCertification>> {
    const queryPayload: NodeCertifyQuery = { id, schema: NodeCertifyQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  async detach(id: ModuleIdentifier): Promise<Address | undefined> {
    const queryPayload: NodeDetachQuery = { id, schema: NodeDetachQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<AddressPayload>>(AddressSchema))
    return payloads.pop()?.address
  }

  async detachQuery(id: ModuleIdentifier, account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    const queryPayload: NodeDetachQuery = { id, schema: NodeDetachQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  override async manifest(maxDepth?: number): Promise<NodeManifestPayload> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth ? { maxDepth } : {}) }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<NodeManifestPayload>>(NodeManifestPayloadSchema))
    return payloads.pop() as NodeManifestPayload
  }

  override async publicChildren(): Promise<ModuleInstance[]> {
    const attached = await this.attached()
    return (await Promise.all(attached.map((address) => this.resolve(address)))).filter(exists)
  }

  async registered(): Promise<Address[]> {
    const queryPayload: NodeRegisteredQuery = { schema: NodeRegisteredQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<WithMeta<AddressPayload>>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async registeredQuery(account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    const queryPayload: NodeRegisteredQuery = { schema: NodeRegisteredQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }
}
