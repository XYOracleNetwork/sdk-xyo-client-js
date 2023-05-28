import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import {
  AbstractModule,
  CompositeModuleResolver,
  duplicateModules,
  Module,
  ModuleConfig,
  ModuleErrorBuilder,
  ModuleFilter,
  ModuleQueryResult,
  QueryBoundWitness,
  QueryBoundWitnessWrapper,
} from '@xyo-network/module'
import {
  NodeConfigSchema,
  NodeModule,
  NodeModuleEventData,
  NodeModuleParams,
  XyoNodeAttachedQuerySchema,
  XyoNodeAttachQuerySchema,
  XyoNodeDetachQuerySchema,
  XyoNodeQuery,
  XyoNodeQueryBase,
  XyoNodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractNode<TParams extends NodeModuleParams = NodeModuleParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends AbstractModule<TParams, TEventData>
  implements NodeModule<TParams, TEventData>, Module<TParams, TEventData>
{
  static override readonly configSchema = NodeConfigSchema

  protected readonly privateResolver = new CompositeModuleResolver()

  private readonly isNode = true

  get isModuleResolver(): boolean {
    return true
  }

  override get queries(): string[] {
    return [XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema, XyoNodeAttachedQuerySchema, XyoNodeRegisteredQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<XyoNodeQueryBase['schema'], string> {
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
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoNodeQuery>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = new Account()
    const resultPayloads: Payload[] = []
    try {
      switch (queryPayload.schema) {
        case XyoNodeAttachQuerySchema: {
          const address = await this.attach(queryPayload.nameOrAddress, queryPayload.external)
          if (address) {
            const payload = new PayloadBuilder({ schema: AddressSchema }).fields({ address }).build()
            resultPayloads.push(payload)
          }
          break
        }
        case XyoNodeDetachQuerySchema: {
          const address = await this.detach(queryPayload.nameOrAddress)
          if (address) {
            const payload = new PayloadBuilder({ schema: AddressSchema }).fields({ address }).build()
            resultPayloads.push(payload)
          }
          break
        }
        case XyoNodeAttachedQuerySchema: {
          const addresses = await this.attached()
          for (const address of addresses) {
            const payload = new PayloadBuilder({ schema: AddressSchema }).fields({ address }).build()
            resultPayloads.push(payload)
          }
          break
        }
        case XyoNodeRegisteredQuerySchema: {
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
      const error = ex as Error
      resultPayloads.push(
        new ModuleErrorBuilder()
          .sources([await wrapper.hashAsync()])
          .message(error.message)
          .build(),
      )
    }
    return this.bindQueryResult(queryPayload, resultPayloads, [queryAccount])
  }

  protected override async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]> {
    return [...(await this.privateResolver.resolve<TModule>(filter)), ...(await super.resolve<TModule>(filter))].filter(duplicateModules)
  }

  abstract attach(nameOrAddress: string, external?: boolean): Promisable<string | undefined>
  abstract detach(nameOrAddress: string): Promisable<string | undefined>
}
