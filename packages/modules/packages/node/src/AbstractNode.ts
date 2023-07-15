import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { handleErrorAsync } from '@xyo-network/error'
import { NodeManifestPayload, NodeManifestPayloadSchema } from '@xyo-network/manifest-model'
import { ModuleWrapper } from '@xyo-network/module'
import { AbstractIndirectModule, CompositeModuleResolver, ModuleErrorBuilder } from '@xyo-network/module-abstract'
import {
  duplicateModules,
  isDirectModule,
  Module,
  ModuleConfig,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import {
  IndirectNodeModule,
  NodeAttachedQuerySchema,
  NodeAttachQuerySchema,
  NodeConfigSchema,
  NodeDetachQuerySchema,
  NodeModuleEventData,
  NodeModuleParams,
  NodeQuery,
  NodeQueryBase,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { ModuleError, Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractNode<TParams extends NodeModuleParams = NodeModuleParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractIndirectModule<TParams, TEventData>
  implements IndirectNodeModule<TParams, TEventData>, Module<TParams, TEventData>
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
    return (await (this.downResolver.resolve() ?? [])).filter((module) => module.address !== this.address)
  }

  register(_module: Module): Promisable<void> {
    throw new Error('Method not implemented.')
  }

  registered(): Promisable<string[]> {
    throw new Error('Method not implemented.')
  }

  registeredModules(): Promisable<Module[]> {
    throw new Error('Method not implemented.')
  }

  override async resolve<TModule extends Module = Module>(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<TModule[]>
  override async resolve<TModule extends Module = Module>(nameOrAddress: string, options?: ModuleFilterOptions): Promise<TModule | undefined>
  override async resolve<TModule extends Module = Module>(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<TModule | TModule[] | undefined> {
    //checking type of nameOrAddressOrFilter before calling other functions since TS seems
    //to need help here narrowing before the call
    if (typeof nameOrAddressOrFilter === 'string') {
      switch (options?.visibility) {
        case 'private': {
          return await this.resolvePrivate<TModule>(nameOrAddressOrFilter)
        }
        case 'all': {
          return await this.resolveAll<TModule>(nameOrAddressOrFilter)
        }
        default: {
          return await super.resolve<TModule>(nameOrAddressOrFilter, options)
        }
      }
    } else {
      switch (options?.visibility) {
        case 'all': {
          return await this.resolveAll<TModule>(nameOrAddressOrFilter)
        }
        case 'private': {
          return await this.resolvePrivate<TModule>(nameOrAddressOrFilter)
        }
        default: {
          return await super.resolve<TModule>(nameOrAddressOrFilter, options)
        }
      }
    }
  }

  unregister(_module: Module): Promisable<this> {
    throw new Error('Method not implemented.')
  }

  protected override async discoverHandler(): Promise<Payload[]> {
    const childMods = await this.attachedModules()
    const childModAddresses = childMods.map((mod) =>
      new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: mod.address, name: mod.config.name }).build(),
    )

    return [...(await super.discoverHandler()), ...childModAddresses]
  }

  protected override async manifestHandler(): Promise<NodeManifestPayload> {
    const manifest: NodeManifestPayload = { ...(await super.manifestHandler()), schema: NodeManifestPayloadSchema }

    const notThisModule = (module: Module) => module.address !== this.address
    const toManifest = (module: Module) => (isDirectModule(module) ? module.manifest() : ModuleWrapper.wrap(module, this.account).manifest())

    const privateModulesList = await this.privateResolver.resolve()
    const privateModules = await Promise.all((await this.privateResolver.resolve()).filter(notThisModule).map(toManifest))
    console.log(`manifestHandler:privateModules:${privateModulesList.length}`)
    if (privateModules.length > 0) {
      manifest.modules = manifest.modules ?? {}
      manifest.modules.private = privateModules
    }

    const publicModulesList = await this.downResolver.resolve()
    const publicModules = await Promise.all((await this.downResolver.resolve()).filter(notThisModule).map(toManifest))
    console.log(`manifestHandler:publicModules:${publicModulesList.length}`)
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
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<NodeQuery>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = Account.randomSync()
    const resultPayloads: Payload[] = []
    const errorPayloads: ModuleError[] = []
    try {
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
    } catch (ex) {
      await handleErrorAsync(ex, async (error) => {
        errorPayloads.push(
          new ModuleErrorBuilder()
            .sources([await wrapper.hashAsync()])
            .name(this.config.name ?? '<Unknown>')
            .query(query.schema)
            .message(error.message)
            .build(),
        )
      })
    }
    return (await this.bindQueryResult(queryPayload, resultPayloads, [queryAccount], errorPayloads))[0]
  }

  private async resolveAll<TModule extends Module = Module>(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<TModule[]>
  private async resolveAll<TModule extends Module = Module>(nameOrAddress: string, options?: ModuleFilterOptions): Promise<TModule | undefined>
  private async resolveAll<TModule extends Module = Module>(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<TModule | TModule[] | undefined> {
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return (await this.resolvePrivate<TModule>(nameOrAddressOrFilter, options)) ?? (await super.resolve<TModule>(nameOrAddressOrFilter, options))
      }
      default: {
        return [
          ...(await this.resolvePrivate<TModule>(nameOrAddressOrFilter, options)),
          ...(await super.resolve<TModule>(nameOrAddressOrFilter, options)),
        ].filter(duplicateModules)
      }
    }
  }

  private async resolvePrivate<TModule extends Module = Module>(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<TModule[]>
  private async resolvePrivate<TModule extends Module = Module>(nameOrAddress: string, options?: ModuleFilterOptions): Promise<TModule | undefined>
  private async resolvePrivate<TModule extends Module = Module>(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<TModule | TModule[] | undefined> {
    const direction = options?.direction ?? 'all'
    const down = direction === 'down' || direction === 'all'
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return down ? await this.privateResolver.resolve<TModule>(nameOrAddressOrFilter) : undefined
      }
      default: {
        return down ? await this.privateResolver.resolve<TModule>(nameOrAddressOrFilter) : undefined
      }
    }
  }

  abstract attach(nameOrAddress: string, external?: boolean): Promisable<string | undefined>
  abstract detach(nameOrAddress: string): Promisable<string | undefined>
}
