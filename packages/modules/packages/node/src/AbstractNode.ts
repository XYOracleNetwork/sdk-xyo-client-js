import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { handleErrorAsync } from '@xyo-network/error'
import { NodeManifest } from '@xyo-network/manifest'
import {
  AbstractModule,
  CompositeModuleResolver,
  duplicateModules,
  Module,
  ModuleConfig,
  ModuleError,
  ModuleErrorBuilder,
  ModuleFilter,
  ModuleQueryResult,
  QueryBoundWitness,
  QueryBoundWitnessWrapper,
} from '@xyo-network/module'
import {
  NodeAttachedQuerySchema,
  NodeAttachQuerySchema,
  NodeConfigSchema,
  NodeDetachQuerySchema,
  NodeModule,
  NodeModuleEventData,
  NodeModuleParams,
  NodeQuery,
  NodeQueryBase,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractNode<TParams extends NodeModuleParams = NodeModuleParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractModule<TParams, TEventData>
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
    return await (this.privateResolver.resolve() ?? [])
  }

  override async discover(): Promise<Payload[]> {
    const childMods = await this.attachedModules()
    const childModAddresses = childMods.map((mod) =>
      new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: mod.address, name: mod.config.name }).build(),
    )

    return [...(await super.discover()), ...childModAddresses]
  }

  override async manifest(): Promise<NodeManifest> {
    const manifest: NodeManifest = { ...(await super.manifest()) }

    const privateModules = await Promise.all((await this.privateResolver.resolve()).map((module) => module.manifest()))
    if (privateModules.length > 0) {
      manifest.modules = manifest.modules ?? {}
      manifest.modules.private = privateModules
    }

    const publicModules = await Promise.all((await this.downResolver.resolve()).map((module) => module.manifest()))
    if (publicModules.length > 0) {
      manifest.modules = manifest.modules ?? {}
      manifest.modules.public = publicModules
    }

    return manifest
  }

  register(_module: Module): Promisable<this> {
    throw new Error('Method not implemented.')
  }

  registered(): Promisable<string[]> {
    throw new Error('Method not implemented.')
  }

  registeredModules(): Promisable<Module[]> {
    throw new Error('Method not implemented.')
  }

  unregister(_module: Module): Promisable<this> {
    throw new Error('Method not implemented.')
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

  protected override async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]> {
    return [...(await this.privateResolver.resolve<TModule>(filter)), ...(await super.resolve<TModule>(filter))].filter(duplicateModules)
  }

  abstract attach(nameOrAddress: string, external?: boolean): Promisable<string | undefined>
  abstract detach(nameOrAddress: string): Promisable<string | undefined>
}
