import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import {
  AbstractModule,
  CompositeModuleResolver,
  duplicateModules,
  EventListener,
  Module,
  ModuleConfig,
  ModuleFilter,
  ModuleParams,
  ModuleQueriedEvent,
  ModuleQueriedEventArgs,
  ModuleQueriedEventEmitter,
  ModuleQueryResult,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { NodeConfig, NodeConfigSchema } from './Config'
import {
  ModuleAttachedEvent,
  ModuleAttachedEventArgs,
  ModuleDetachedEvent,
  ModuleDetachedEventArgs,
  ModuleRegisteredEvent,
  ModuleRegisteredEventArgs,
} from './Events'
import { NodeModule } from './Node'
import { XyoNodeAttachedQuerySchema, XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema, XyoNodeQuery, XyoNodeRegisteredQuerySchema } from './Queries'

export type AbstractNodeParams<TConfig extends NodeConfig = NodeConfig> = ModuleParams<TConfig>

export abstract class AbstractNode<TParams extends AbstractNodeParams = AbstractNodeParams> extends AbstractModule<TParams> implements NodeModule {
  static override readonly configSchema = NodeConfigSchema

  protected readonly moduleAttachedEventListeners: EventListener<ModuleAttachedEventArgs>[] = []
  protected readonly moduleDetachedEventListeners: EventListener<ModuleDetachedEventArgs>[] = []
  protected readonly moduleRegisteredEventListeners: EventListener<ModuleRegisteredEventArgs>[] = []

  protected readonly privateResolver = new CompositeModuleResolver()

  private readonly isNode = true

  protected constructor(params: TParams) {
    super(params)
  }

  get isModuleResolver(): boolean {
    return true
  }

  override get queries(): string[] {
    return [XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema, XyoNodeAttachedQuerySchema, XyoNodeRegisteredQuerySchema, ...super.queries]
  }

  static override async create(params?: Partial<AbstractNodeParams>): Promise<AbstractNode> {
    return (await super.create(params)) as AbstractNode
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

  override async discover(): Promise<XyoPayload[]> {
    const childMods = await this.attachedModules()
    const childModAddresses = childMods.map((mod) =>
      new XyoPayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: mod.address, name: mod.config.name }).build(),
    )

    return [...(await super.discover()), ...childModAddresses]
  }

  override on(event: ModuleQueriedEvent, listener: (args: ModuleQueriedEventArgs) => void): this
  override on(event: ModuleAttachedEvent, listener: (args: ModuleAttachedEventArgs) => void): this
  override on(event: ModuleDetachedEvent, listener: (args: ModuleDetachedEventArgs) => void): this
  override on(event: ModuleRegisteredEvent, listener: (args: ModuleRegisteredEventArgs) => void): this
  override on(
    event: ModuleQueriedEvent | ModuleAttachedEvent | ModuleDetachedEvent | ModuleRegisteredEvent,
    listener: (args: ModuleQueriedEventArgs) => void,
  ): this {
    switch (event) {
      case ModuleAttachedEvent:
        this.moduleAttachedEventListeners?.push(listener as EventListener<ModuleAttachedEventArgs>)
        break
      case ModuleDetachedEvent:
        this.moduleDetachedEventListeners?.push(listener as EventListener<ModuleDetachedEventArgs>)
        break
      case ModuleRegisteredEvent:
        this.moduleRegisteredEventListeners?.push(listener as EventListener<ModuleRegisteredEventArgs>)
        break
      default:
        return super.on(event, listener)
    }
    return this
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoNodeQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = new Account()
    const resultPayloads: XyoPayload[] = []
    try {
      switch (typedQuery.schema) {
        case XyoNodeAttachQuerySchema: {
          await this.attach(typedQuery.address)
          break
        }
        case XyoNodeDetachQuerySchema: {
          await this.detach(typedQuery.address)
          break
        }
        case XyoNodeAttachedQuerySchema: {
          const addresses = await this.attached()
          for (const address of addresses) {
            const payload = new XyoPayloadBuilder({ schema: AddressSchema }).fields({ address }).build()
            resultPayloads.push(payload)
          }
          break
        }
        case XyoNodeRegisteredQuerySchema: {
          const addresses = await this.registered()
          for (const address of addresses) {
            const payload = new XyoPayloadBuilder({ schema: AddressSchema }).fields({ address }).build()
            resultPayloads.push(payload)
          }
          break
        }
        default:
          return await super.query(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new XyoErrorBuilder([wrapper.hash], error.message).build())
    }
    return this.bindResult(resultPayloads, queryAccount)
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

  override async start() {
    await super.start()
    return this
  }

  unregister(_module: Module): Promisable<this> {
    throw new Error('Method not implemented.')
  }

  protected override async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]> {
    return [...(await this.privateResolver.resolve<TModule>(filter)), ...(await super.resolve<TModule>(filter))].filter(duplicateModules)
  }

  abstract attach(address: string, external?: boolean): Promisable<void>
  abstract detach(address: string): Promisable<void>
}
