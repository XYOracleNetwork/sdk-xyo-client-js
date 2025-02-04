import { assertEx } from '@xylabs/assert'
import type { Address } from '@xylabs/hex'
import { globallyUnique } from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import type { AccountInstance } from '@xyo-network/account-model'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import type { ModuleManifestPayload, NodeManifestPayload } from '@xyo-network/manifest-model'
import { NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import type {
  AddressPayload,
  Module,
  ModuleConfig,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryHandlerResult,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { AddressSchema } from '@xyo-network/module-model'
import type {
  AttachableNodeInstance,
  ChildCertification,
  ChildCertificationFields,
  NodeAttachedQuery,
  NodeAttachQuery,
  NodeCertifyQuery,
  NodeDetachQuery,
  NodeInstance,
  NodeModule,
  NodeModuleEventData,
  NodeParams,
  NodeQueries,
  NodeRegisteredQuery,
} from '@xyo-network/node-model'
import {
  ChildCertificationSchema,
  NodeAttachedQuerySchema,
  NodeAttachQuerySchema,
  NodeCertifyQuerySchema,
  NodeConfigSchema,
  NodeDetachQuerySchema,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, Schema } from '@xyo-network/payload-model'

export abstract class AbstractNode<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractModuleInstance<TParams, TEventData>
  implements
    AttachableNodeInstance<TParams, TEventData>,
    Module<TParams, TEventData>,
    NodeInstance<TParams, TEventData>,
    ModuleInstance<TParams, TEventData>,
    NodeModule<TParams, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, NodeConfigSchema]
  static override readonly defaultConfigSchema: Schema = NodeConfigSchema
  static override readonly uniqueName = globallyUnique('AbstractNode', AbstractNode, 'xyo')

  private readonly isNode = true

  override get queries(): Schema[] {
    return [
      NodeAttachQuerySchema,
      NodeCertifyQuerySchema,
      NodeDetachQuerySchema,
      NodeAttachedQuerySchema,
      NodeRegisteredQuerySchema,
      ...super.queries,
    ]
  }

  static isNode(mod: unknown) {
    return (mod as AbstractNode).isNode
  }

  async attach(id: ModuleIdentifier, external?: boolean): Promise<Address | undefined> {
    this._noOverride('attach')
    return await this.attachHandler(id, external)
  }

  async attachQuery(id: ModuleIdentifier, external?: boolean, account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    this._noOverride('attachQuery')
    const queryPayload: NodeAttachQuery = {
      external, id, schema: NodeAttachQuerySchema,
    }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  async attached(): Promise<Address[]> {
    this._noOverride('attached')
    return await this.attachedHandler()
  }

  async attachedHandler(): Promise<Address[]> {
    return [...(await this.attachedPublicModules()).map(mod => mod.address), ...(await this.attachedPrivateModules()).map(mod => mod.address)]
  }

  async attachedQuery(account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    this._noOverride('attachedQuery')
    const queryPayload: NodeAttachedQuery = { schema: NodeAttachedQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  async certify(id: ModuleIdentifier): Promise<ChildCertificationFields | undefined> {
    this._noOverride('certify')
    return await this.certifyHandler(id)
  }

  async certifyQuery(id: ModuleIdentifier, account?: AccountInstance): Promise<ModuleQueryResult<ChildCertification>> {
    const queryPayload: NodeCertifyQuery = { id, schema: NodeCertifyQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  async detach(id: ModuleIdentifier): Promise<Address | undefined> {
    this._noOverride('detach')
    return await this.detachHandler(id)
  }

  async detachQuery(id: ModuleIdentifier, account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    this._noOverride('detachQuery')
    const queryPayload: NodeDetachQuery = { id, schema: NodeDetachQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  override async manifest(maxDepth = 10, ignoreAddresses: Address[] = []): Promise<ModuleManifestPayload> {
    return await this.manifestHandler(maxDepth, ignoreAddresses)
  }

  override async privateChildren(): Promise<ModuleInstance[]> {
    return await this.attachedPrivateModules()
  }

  override async publicChildren(): Promise<ModuleInstance[]> {
    return await this.attachedPublicModules()
  }

  async registered(): Promise<Address[]> {
    this._noOverride('registered')
    return await this.registeredHandler()
  }

  async registeredQuery(account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    this._noOverride('registeredQuery')
    const queryPayload: NodeRegisteredQuery = { schema: NodeRegisteredQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  protected async attachedPrivateModules(maxDepth = 1): Promise<ModuleInstance[]> {
    return (await (this.resolvePrivate('*', { maxDepth }) ?? [])).filter(mod => mod.address !== this.address)
  }

  protected async attachedPublicModules(maxDepth = 1): Promise<ModuleInstance[]> {
    return (await (this.downResolver.resolve('*', { direction: 'down', maxDepth }) ?? [])).filter(mod => mod.address !== this.address)
  }

  protected override async generateConfigAndAddress(maxDepth = 10): Promise<Payload[]> {
    const childMods = await this.attachedPublicModules(maxDepth)
    // console.log(`childMods: ${toJsonString(childMods)}`)
    const childModAddresses = childMods.map(mod => new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: mod.address }).build())

    return [...(await super.generateConfigAndAddress(maxDepth)), ...childModAddresses]
  }

  protected override async manifestHandler(maxDepth = 10, ignoreAddresses: Address[] = []): Promise<ModuleManifestPayload> {
    const cachedResult = this._cachedManifests.get(maxDepth)
    if (cachedResult) {
      return cachedResult
    }

    const manifest: NodeManifestPayload = { ...(await super.manifestHandler(maxDepth, ignoreAddresses)), schema: NodeManifestPayloadSchema }
    const newIgnoreAddresses = [...ignoreAddresses, this.address]

    const notThisModule = (mod: ModuleInstance) => mod.address !== this.address && !ignoreAddresses.includes(mod.address)
    const toManifest = (mod: ModuleInstance) => mod.manifest(maxDepth - 1, newIgnoreAddresses)

    const publicChildren = await this.publicChildren()
    const publicModuleManifests = await Promise.all(publicChildren.filter(notThisModule).map(toManifest))
    if (publicModuleManifests.length > 0) {
      manifest.modules = manifest.modules ?? {}
      manifest.modules.public = publicModuleManifests
    }

    this._cachedManifests.set(maxDepth, manifest)

    return manifest
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<NodeQueries>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(await this.queryable(query, payloads, queryConfig), () => 'Module is not queryable with the provided query')
    const resultPayloads: Payload[] = []
    switch (queryPayload.schema) {
      case NodeAttachQuerySchema: {
        const address = await this.attachHandler(queryPayload.id, queryPayload.external)
        if (address) {
          const payload = new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeCertifyQuerySchema: {
        const fields = await this.certifyHandler(queryPayload.id)
        if (fields) {
          const payload = new PayloadBuilder<ChildCertification>({ schema: ChildCertificationSchema }).fields(fields).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeDetachQuerySchema: {
        const address = await this.detachHandler(queryPayload.id)
        if (address) {
          const payload = new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeAttachedQuerySchema: {
        const addresses = await this.attachedHandler()
        for (const address of addresses) {
          const payload = new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeRegisteredQuerySchema: {
        const addresses = await this.registeredHandler()
        for (const address of addresses) {
          const payload = new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      default: {
        return await super.queryHandler(query, payloads)
      }
    }
    return resultPayloads
  }

  abstract attachHandler(id: ModuleIdentifier, external?: boolean): Promisable<Address | undefined>

  abstract certifyHandler(id: ModuleIdentifier): Promisable<ChildCertificationFields | undefined>

  abstract detachHandler(id: ModuleIdentifier): Promisable<Address | undefined>

  abstract registeredHandler(): Promisable<Address[]>
}
