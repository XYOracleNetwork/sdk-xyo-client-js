import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import {
  duplicateModules,
  Module,
  ModuleConfig,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleQueryHandlerResult,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import {
  NodeAttachedQuerySchema,
  NodeAttachQuerySchema,
  NodeConfigSchema,
  NodeDetachQuerySchema,
  NodeModule,
  NodeModuleEventData,
  NodeParams,
  NodeQuery,
  NodeQueryBase,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

export abstract class AbstractNode<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractModuleInstance<TParams, TEventData>
  implements NodeModule<TParams, TEventData>, Module<TParams, TEventData>
{
  static override readonly configSchemas: string[] = [NodeConfigSchema]

  protected readonly privateResolver = new CompositeModuleResolver()

  private readonly isNode = true

  get isModuleResolver(): boolean {
    return true
  }

  override get queries(): string[] {
    return [NodeAttachQuerySchema, NodeDetachQuerySchema, NodeAttachedQuerySchema, NodeRegisteredQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<NodeQueryBase['schema'], string> {
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

  async attached(): Promise<string[]> {
    return (await this.attachedModules()).map((module) => module.address)
  }

  async attachedModules(): Promise<Module[]> {
    // return (await (this.resolve(undefined, { direction: 'down', maxDepth: CompositeModuleResolver.defaultMaxDepth }) ?? [])).filter(
    //   (module) => module.address !== this.address,
    // )
    return (await (this.resolve(undefined, { direction: 'down', maxDepth: 2 }) ?? [])).filter((module) => module.address !== this.address)
  }

  override async manifest(maxDepth?: number, ignoreAddresses?: string[]): Promise<NodeManifestPayload> {
    return await this.manifestHandler(maxDepth, ignoreAddresses)
  }

  register(_module: ModuleInstance): Promisable<void> {
    throw new Error('Method not implemented.')
  }

  registered(): Promisable<string[]> {
    throw new Error('Method not implemented.')
  }

  registeredModules(): Promisable<Module[]> {
    throw new Error('Method not implemented.')
  }

  override async resolve(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  override async resolve(nameOrAddress: string, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  override async resolve(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    //checking type of nameOrAddressOrFilter before calling other functions since TS seems
    //to need help here narrowing before the call
    if (typeof nameOrAddressOrFilter === 'string') {
      switch (options?.visibility) {
        case 'private': {
          return await this.resolvePrivate(nameOrAddressOrFilter)
        }
        case 'all': {
          return await this.resolveAll(nameOrAddressOrFilter)
        }
        default: {
          return await super.resolve(nameOrAddressOrFilter, options)
        }
      }
    } else {
      switch (options?.visibility) {
        case 'all': {
          return await this.resolveAll(nameOrAddressOrFilter)
        }
        case 'private': {
          return await this.resolvePrivate(nameOrAddressOrFilter)
        }
        default: {
          return await super.resolve(nameOrAddressOrFilter, options)
        }
      }
    }
  }

  unregister(_module: ModuleInstance): Promisable<this> {
    throw new Error('Method not implemented.')
  }

  protected override async discoverHandler(): Promise<Payload[]> {
    const childMods = await this.attachedModules()
    const childModAddresses = childMods.map((mod) =>
      new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: mod.address, name: mod.config.name }).build(),
    )

    return [...(await super.discoverHandler()), ...childModAddresses]
  }

  protected override async manifestHandler(maxDepth?: number, ignoreAddresses: string[] = []): Promise<NodeManifestPayload> {
    const manifest: NodeManifestPayload = { ...(await super.manifestHandler()), schema: NodeManifestPayloadSchema }
    const newIgnoreAddresses = [...ignoreAddresses, this.address]

    const notThisModule = (module: ModuleInstance) => module.address !== this.address && !ignoreAddresses.includes(module.address)
    const toManifest = (module: ModuleInstance) => module.manifest(maxDepth, newIgnoreAddresses)

    /*const privateModules = await Promise.all((await this.privateResolver.resolve()).filter(notThisModule).map(toManifest))
    if (privateModules.length > 0) {
      manifest.modules = manifest.modules ?? {}
      manifest.modules.private = privateModules
    }*/

    const publicModules = await Promise.all((await this.resolve(undefined, { direction: 'down', maxDepth })).filter(notThisModule).map(toManifest))
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
    const wrapper = QueryBoundWitnessWrapper.parseQuery<NodeQuery>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    switch (queryPayload.schema) {
      case NodeAttachQuerySchema: {
        const address = await this.attach(queryPayload.nameOrAddress, queryPayload.external)
        if (address) {
          const payload = new PayloadBuilder({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeDetachQuerySchema: {
        const address = await this.detach(queryPayload.nameOrAddress)
        if (address) {
          const payload = new PayloadBuilder({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeAttachedQuerySchema: {
        const addresses = await this.attached()
        for (const address of addresses) {
          const payload = new PayloadBuilder({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      case NodeRegisteredQuerySchema: {
        const addresses = await this.registered()
        for (const address of addresses) {
          const payload = new PayloadBuilder({ schema: AddressSchema }).fields({ address }).build()
          resultPayloads.push(payload)
        }
        break
      }
      default:
        return await super.queryHandler(query, payloads)
    }
    return resultPayloads
  }

  private async resolveAll(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  private async resolveAll(nameOrAddress: string, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  private async resolveAll(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return (await this.resolvePrivate(nameOrAddressOrFilter, options)) ?? (await super.resolve(nameOrAddressOrFilter, options))
      }
      default: {
        return [...(await this.resolvePrivate(nameOrAddressOrFilter, options)), ...(await super.resolve(nameOrAddressOrFilter, options))].filter(
          duplicateModules,
        )
      }
    }
  }

  private async resolvePrivate(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  private async resolvePrivate(nameOrAddress: string, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  private async resolvePrivate(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    const direction = options?.direction ?? 'all'
    const down = direction === 'down' || direction === 'all'
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return down ? await this.privateResolver.resolve(nameOrAddressOrFilter) : undefined
      }
      default: {
        return down ? await this.privateResolver.resolve(nameOrAddressOrFilter) : undefined
      }
    }
  }

  abstract attach(nameOrAddress: string, external?: boolean): Promisable<string | undefined>
  abstract detach(nameOrAddress: string): Promisable<string | undefined>
}
