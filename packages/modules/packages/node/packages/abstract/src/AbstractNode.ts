import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { globallyUnique } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ModuleManifestPayload, NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { Module, ModuleConfig, ModuleIdentifier, ModuleInstance, ModuleQueryHandlerResult, ModuleQueryResult } from '@xyo-network/module-model'
import {
  AttachableNodeInstance,
  ChildCertification,
  ChildCertificationFields,
  ChildCertificationSchema,
  NodeAttachedQuery,
  NodeAttachedQuerySchema,
  NodeAttachQuery,
  NodeAttachQuerySchema,
  NodeCertifyQuery,
  NodeCertifyQuerySchema,
  NodeConfigSchema,
  NodeDetachQuery,
  NodeDetachQuerySchema,
  NodeInstance,
  NodeModule,
  NodeModuleEventData,
  NodeParams,
  NodeQueries,
  NodeRegisteredQuery,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, Schema } from '@xyo-network/payload-model'

export abstract class AbstractNode<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractModuleInstance<TParams, TEventData>
  implements
    AttachableNodeInstance<TParams, TEventData>,
    Module<TParams, TEventData>,
    NodeInstance<TParams, TEventData>,
    ModuleInstance<TParams, TEventData>,
    NodeModule<TParams, TEventData>
{
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

  protected override get _queryAccountPaths(): Record<NodeQueries['schema'], string> {
    return {
      [NodeAttachQuerySchema]: '1/1',
      [NodeAttachedQuerySchema]: '1/2',
      [NodeCertifyQuerySchema]: '1/5',
      [NodeDetachQuerySchema]: '1/3',
      [NodeRegisteredQuerySchema]: '1/4',
    }
  }

  static isNode(module: unknown) {
    return (module as AbstractNode).isNode
  }

  async attach(id: ModuleIdentifier, external?: boolean): Promise<Address | undefined> {
    this._noOverride('attach')
    return await this.attachHandler(id, external)
  }

  async attachQuery(id: ModuleIdentifier, external?: boolean, account?: AccountInstance): Promise<ModuleQueryResult<AddressPayload>> {
    this._noOverride('attachQuery')
    const queryPayload: NodeAttachQuery = { external, id, schema: NodeAttachQuerySchema }
    return await this.sendQueryRaw(queryPayload, [], account)
  }

  async attached(): Promise<Address[]> {
    this._noOverride('attached')
    return await this.attachedHandler()
  }

  async attachedHandler(): Promise<Address[]> {
    return [
      ...(await this.attachedPublicModules()).map((module) => module.address),
      ...(await this.attachedPrivateModules()).map((module) => module.address),
    ]
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
    return (await (this.resolvePrivate('*', { maxDepth }) ?? [])).filter((module) => module.address !== this.address)
  }

  protected async attachedPublicModules(maxDepth = 1): Promise<ModuleInstance[]> {
    return (await (this.downResolver.resolve('*', { direction: 'down', maxDepth }) ?? [])).filter((module) => module.address !== this.address)
  }

  protected override async generateConfigAndAddress(maxDepth = 10): Promise<Payload[]> {
    const childMods = await this.attachedPublicModules(maxDepth)
    //console.log(`childMods: ${toJsonString(childMods)}`)
    const childModAddresses = await Promise.all(
      childMods.map((mod) => new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: mod.address }).build()),
    )

    return [...(await super.generateConfigAndAddress(maxDepth)), ...childModAddresses]
  }

  protected override async manifestHandler(maxDepth = 10, ignoreAddresses: Address[] = []): Promise<ModuleManifestPayload> {
    const cachedResult = this._cachedManifests.get(maxDepth)
    if (cachedResult) {
      return cachedResult
    }

    const manifest: NodeManifestPayload = { ...(await super.manifestHandler(maxDepth, ignoreAddresses)), schema: NodeManifestPayloadSchema }
    const newIgnoreAddresses = [...ignoreAddresses, this.address]

    const notThisModule = (module: ModuleInstance) => module.address !== this.address && !ignoreAddresses.includes(module.address)
    const toManifest = (module: ModuleInstance) => module.manifest(maxDepth - 1, newIgnoreAddresses)

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
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<NodeQueries>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(await this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    switch (queryPayload.schema) {
      case NodeAttachQuerySchema: {
        const address = await this.attachHandler(queryPayload.id, queryPayload.external)
        if (address) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeCertifyQuerySchema: {
        const fields = await this.certifyHandler(queryPayload.id)
        if (fields) {
          const payload = await new PayloadBuilder<ChildCertification>({ schema: ChildCertificationSchema }).fields(fields).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeDetachQuerySchema: {
        const address = await this.detachHandler(queryPayload.id)
        if (address) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeAttachedQuerySchema: {
        const addresses = await this.attachedHandler()
        for (const address of addresses) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeRegisteredQuerySchema: {
        const addresses = await this.registeredHandler()
        for (const address of addresses) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
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
