import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import {
  Module,
  ModuleDescription,
  ModuleFilter,
  ModuleQueryResult,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoModule,
  XyoModuleParams,
  XyoModuleResolver,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { NodeConfig } from './Config'
import { NodeModule } from './NodeModule'
import { XyoNodeAttachedQuerySchema, XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema, XyoNodeQuery, XyoNodeRegisteredQuerySchema } from './Queries'

export abstract class AbstractNode<TConfig extends NodeConfig = NodeConfig, TModule extends XyoModule = XyoModule>
  extends XyoModule<TConfig>
  implements NodeModule
{
  public isModuleResolver = true

  protected internalResolver: XyoModuleResolver<TModule>
  private _archivist?: Module

  protected constructor(params: XyoModuleParams<TConfig>, internalResolver?: XyoModuleResolver<TModule>) {
    super(params)
    this.internalResolver = internalResolver ?? new XyoModuleResolver<TModule>()
  }

  static override async create(params?: Partial<XyoModuleParams<NodeConfig>>): Promise<AbstractNode> {
    return (await super.create(params)) as AbstractNode
  }

  async attached(): Promise<string[]> {
    return (await this.attachedModules()).map((module) => module.address)
  }

  async attachedModules(): Promise<TModule[]> {
    return await (this.internalResolver.resolve() ?? [])
  }

  override async description(): Promise<ModuleDescription> {
    const desc = await super.description()
    const children = await Promise.all((await this.attachedModules()).map((mod) => mod.description()))
    return { ...desc, children }
  }

  public override queries() {
    return [XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema, XyoNodeAttachedQuerySchema, XyoNodeRegisteredQuerySchema, ...super.queries()]
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoNodeQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))

    const queryAccount = new Account()
    const resultPayloads: XyoPayload[] = []
    try {
      switch (typedQuery.schema) {
        case XyoNodeAttachQuerySchema: {
          this.attach(typedQuery.address)
          break
        }
        case XyoNodeDetachQuerySchema: {
          this.detach(typedQuery.address)
          break
        }
        case XyoNodeAttachedQuerySchema: {
          await this.attached()
          break
        }
        case XyoNodeRegisteredQuerySchema: {
          // TODO: Make address payload, return array of them via BW
          this.registered()
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

  register(_module: TModule): void {
    throw new Error('Method not implemented.')
  }

  registered(): string[] {
    throw new Error('Method not implemented.')
  }

  registeredModules(): TModule[] {
    throw new Error('Method not implemented.')
  }

  override async start() {
    await super.start()
    return this
  }

  unregister(_module: TModule): void {
    throw new Error('Method not implemented.')
  }

  abstract attach(address: string): void
  abstract detach(address: string): void
  abstract resolve(filter?: ModuleFilter): Promisable<TModule[]>
  abstract tryResolve(filter?: ModuleFilter): Promisable<TModule[]>
}

/** @deprecated use AbstractNode instead */
export abstract class XyoNode<TConfig extends NodeConfig = NodeConfig, TModule extends XyoModule = XyoModule> extends AbstractNode<
  TConfig,
  TModule
> {}
