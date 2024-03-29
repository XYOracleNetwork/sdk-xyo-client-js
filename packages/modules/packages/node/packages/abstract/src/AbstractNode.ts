import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ModuleManifestPayload, NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import {
  duplicateModules,
  Module,
  ModuleConfig,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleQueryHandlerResult,
} from '@xyo-network/module-model'
import {
  NodeAttachedQuerySchema,
  NodeAttachQuerySchema,
  NodeConfigSchema,
  NodeDetachQuerySchema,
  NodeModule,
  NodeModuleEventData,
  NodeParams,
  NodeQueries,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

export abstract class AbstractNode<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractModuleInstance<TParams, TEventData>
  implements NodeModule<TParams, TEventData>, Module<TParams, TEventData>
{
  static override readonly configSchemas: string[] = [NodeConfigSchema]

  private readonly isNode = true

  override get queries(): string[] {
    return [NodeAttachQuerySchema, NodeDetachQuerySchema, NodeAttachedQuerySchema, NodeRegisteredQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<NodeQueries['schema'], string> {
    return {
      'network.xyo.query.node.attach': '1/1',
      'network.xyo.query.node.attached': '1/2',
      'network.xyo.query.node.detach': '1/3',
      'network.xyo.query.node.registered': '1/4',
    }
  }

  static isNode(module: unknown) {
    return (module as AbstractNode).isNode
  }

  async attached(): Promise<Address[]> {
    return [
      ...(await this.attachedPublicModules()).map((module) => module.address),
      ...(await this.attachedPrivateModules()).map((module) => module.address),
    ]
  }

  override async manifest(maxDepth = 5, ignoreAddresses: Address[] = []): Promise<ModuleManifestPayload> {
    return await this.manifestHandler(maxDepth, ignoreAddresses)
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(): Promise<ModuleInstance[]>
  override async resolve(all: '*', options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  override async resolve(filter: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  override async resolve(id: ModuleIdentifier, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  override async resolve(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  override async resolve(
    idOrFilter: ModuleFilter | ModuleIdentifier = '*',
    options?: ModuleFilterOptions,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    const { visibility = 'all' } = options ?? {}
    const mutatedOptions = { ...options, visibility }
    //checking type of nameOrAddressOrFilter before calling other functions since TS seems
    //to need help here narrowing before the call
    if (idOrFilter === '*') {
      switch (options?.visibility) {
        case 'private': {
          return (await this.resolvePrivate('*', mutatedOptions)).filter((mod) => mod.address !== this.address)
        }
        case 'all': {
          return (await this.resolveAll('*', mutatedOptions)).filter((mod) => mod.address !== this.address)
        }
        default: {
          return (await super.resolve('*', mutatedOptions)).filter((mod) => mod.address !== this.address)
        }
      }
    }
    if (typeof idOrFilter === 'string') {
      switch (options?.visibility) {
        case 'private': {
          return await this.resolvePrivate(idOrFilter, mutatedOptions)
        }
        case 'all': {
          return await this.resolveAll(idOrFilter, mutatedOptions)
        }
        default: {
          return await super.resolve(idOrFilter, mutatedOptions)
        }
      }
    } else {
      switch (options?.visibility) {
        case 'all': {
          return await this.resolveAll(idOrFilter, mutatedOptions)
        }
        case 'private': {
          return await this.resolvePrivate(idOrFilter, mutatedOptions)
        }
        default: {
          return await super.resolve(idOrFilter, mutatedOptions)
        }
      }
    }
  }

  protected async attachedPrivateModules(maxDepth = 1): Promise<ModuleInstance[]> {
    return (await (this.privateResolver.resolve('*', { maxDepth, visibility: 'public' }) ?? [])).filter((module) => module.address !== this.address)
  }

  protected async attachedPublicModules(maxDepth = 1): Promise<ModuleInstance[]> {
    return (await (this.downResolver.resolve('*', { maxDepth, visibility: 'public' }) ?? [])).filter((module) => module.address !== this.address)
  }

  protected override async discoverHandler(maxDepth = 5): Promise<Payload[]> {
    const childMods = await this.attachedPublicModules(maxDepth)
    //console.log(`childMods: ${toJsonString(childMods)}`)
    const childModAddresses = await Promise.all(
      childMods.map((mod) =>
        new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: mod.address, name: mod.config.name }).build(),
      ),
    )

    return [...(await super.discoverHandler(maxDepth)), ...childModAddresses]
  }

  protected override async manifestHandler(maxDepth = 5, ignoreAddresses: Address[] = []): Promise<ModuleManifestPayload> {
    const manifest: NodeManifestPayload = { ...(await super.manifestHandler(maxDepth, ignoreAddresses)), schema: NodeManifestPayloadSchema }
    const newIgnoreAddresses = [...ignoreAddresses, this.address]

    const notThisModule = (module: ModuleInstance) => module.address !== this.address && !ignoreAddresses.includes(module.address)
    const toManifest = (module: ModuleInstance) => module.manifest(maxDepth - 1, newIgnoreAddresses)

    /*const privateModules = await Promise.all((await this.privateResolver.resolve()).filter(notThisModule).map(toManifest))
    if (privateModules.length > 0) {
      manifest.modules = manifest.modules ?? {}
      manifest.modules.private = privateModules
    }*/

    const publicChildren = await this.resolve('*', { direction: 'down', maxDepth: 1, visibility: 'public' })
    const publicModules = await Promise.all(publicChildren.filter(notThisModule).map(toManifest))
    if (publicModules.length > 0) {
      manifest.modules = manifest.modules ?? {}
      manifest.modules.public = publicModules
    }

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
        const address = await this.attach(queryPayload.nameOrAddress, queryPayload.external)
        if (address) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeDetachQuerySchema: {
        const address = await this.detach(queryPayload.nameOrAddress)
        if (address) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeAttachedQuerySchema: {
        const addresses = await this.attached()
        for (const address of addresses) {
          const payload = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeRegisteredQuerySchema: {
        const addresses = await this.registered()
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

  private async resolveAll(all: '*', options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  private async resolveAll(filter: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  private async resolveAll(id: ModuleIdentifier, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  private async resolveAll(
    idOrFilter: ModuleFilter | ModuleIdentifier,
    options?: ModuleFilterOptions,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    if (idOrFilter === '*') {
      return [...(await this.resolvePrivate(idOrFilter, options)), ...(await super.resolve(idOrFilter, options))].filter(duplicateModules)
    }
    switch (typeof idOrFilter) {
      case 'string': {
        return (await this.resolvePrivate(idOrFilter, options)) ?? (await super.resolve(idOrFilter, options))
      }
      default: {
        return [...(await this.resolvePrivate(idOrFilter, options)), ...(await super.resolve(idOrFilter, options))].filter(duplicateModules)
      }
    }
  }

  private async resolvePrivate(all: '*', options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  private async resolvePrivate(filter: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  private async resolvePrivate(id: ModuleIdentifier, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  private async resolvePrivate(
    idOrFilter: ModuleFilter | ModuleIdentifier,
    options?: ModuleFilterOptions,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    const direction = options?.direction ?? 'all'
    const down = direction === 'down' || direction === 'all'
    if (idOrFilter === '*') {
      return down ? await this.privateResolver.resolve(idOrFilter) : []
    }
    switch (typeof idOrFilter) {
      case 'string': {
        return down ? await this.privateResolver.resolve(idOrFilter) : undefined
      }
      default: {
        return down ? await this.privateResolver.resolve(idOrFilter) : undefined
      }
    }
  }

  abstract attach(id: ModuleIdentifier, external?: boolean): Promisable<Address | undefined>
  abstract detach(id: ModuleIdentifier): Promisable<Address | undefined>
  abstract registered(): Promisable<Address[]>
}
