import type { Address } from '@xylabs/sdk-js'
import type { AccountInstance } from '@xyo-network/account-model'
import type { NodeManifestPayload } from '@xyo-network/manifest-model'
import { NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import type {
  AddressPayload,
  InstanceTypeCheck,
  ModuleIdentifier,
  ModuleManifestQuery,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import {
  AddressSchema,
  ModuleManifestQuerySchema,
} from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import type {
  ChildCertification,
  ChildCertificationFields,
  NodeAttachedQuery,
  NodeAttachQuery,
  NodeCertifyQuery,
  NodeDetachQuery,
  NodeInstance,
  NodeModule,
  NodeRegisteredQuery,
} from '@xyo-network/node-model'
import {
  ChildCertificationSchema,
  isNodeInstance,
  isNodeModule,
  NodeAttachedQuerySchema,
  NodeAttachQuerySchema,
  NodeCertifyQuerySchema,
  NodeDetachQuerySchema,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'

constructableModuleWrapper()
export class NodeWrapper<TWrappedModule extends NodeModule = NodeModule>
  extends ModuleWrapper<TWrappedModule>
  implements NodeInstance<TWrappedModule['params']> {
  static override readonly instanceIdentityCheck: InstanceTypeCheck<NodeInstance> = isNodeInstance
  static override readonly moduleIdentityCheck = isNodeModule
  static override readonly requiredQueries = [NodeAttachQuerySchema, ...ModuleWrapper.requiredQueries]

  protected _attached?: Address[]
  protected _attachedMutex = new Mutex()

  async attach(id: ModuleIdentifier, external?: boolean): Promise<Address | undefined> {
    const queryPayload: NodeAttachQuery = {
      external, id, schema: NodeAttachQuerySchema,
    }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  async attachQuery(id: ModuleIdentifier, external?: boolean, account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    const queryPayload: NodeAttachQuery = {
      external, id, schema: NodeAttachQuerySchema,
    }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  async attached(): Promise<Address[]> {
    return await this._attachedMutex.runExclusive(async () => {
      if (this._attached === undefined) {
        const queryPayload: NodeAttachedQuery = { schema: NodeAttachedQuerySchema }
        const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
        this._attached = payloads.map(p => p.address)
      }
      return this._attached
    })
  }

  async attachedQuery(account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    const queryPayload: NodeAttachedQuery = { schema: NodeAttachedQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  async certify(id: ModuleIdentifier): Promise<ChildCertificationFields | undefined> {
    const queryPayload: NodeCertifyQuery = { id, schema: NodeCertifyQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<ChildCertification>(ChildCertificationSchema))
    return payloads.pop()
  }

  async certifyQuery(id: ModuleIdentifier, account?: AccountInstance): Promise<ModuleQueryResult<ChildCertification>> {
    const queryPayload: NodeCertifyQuery = { id, schema: NodeCertifyQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  async detach(id: ModuleIdentifier): Promise<Address | undefined> {
    const queryPayload: NodeDetachQuery = { id, schema: NodeDetachQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  async detachQuery(id: ModuleIdentifier, account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    const queryPayload: NodeDetachQuery = { id, schema: NodeDetachQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  override async manifest(maxDepth?: number): Promise<NodeManifestPayload> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth ? { maxDepth } : {}) }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema))
    return payloads.pop() as NodeManifestPayload
  }

  async registered(): Promise<Address[]> {
    const queryPayload: NodeRegisteredQuery = { schema: NodeRegisteredQuerySchema }
    const payloads = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map(p => p.address)
  }

  async registeredQuery(account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    const queryPayload: NodeRegisteredQuery = { schema: NodeRegisteredQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }
}
