import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoArchivistWrapper, XyoMemoryArchivist } from '@xyo-network/archivist'
import {
  Module,
  ModuleFilter,
  ModuleQueryResult,
  ModuleResolver,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoModule,
  XyoModuleParams,
  XyoModuleResolver,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoModuleInstanceSchema } from '@xyo-network/module-instance-payload-plugin'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { NodeConfig } from './Config'
import { NodeModule } from './NodeModule'
import { XyoNodeAttachedQuerySchema, XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema, XyoNodeQuery, XyoNodeRegisteredQuerySchema } from './Queries'

export abstract class XyoNode<TConfig extends NodeConfig = NodeConfig, TModule extends XyoModule = XyoModule>
  extends XyoModule<TConfig>
  implements NodeModule, ModuleResolver
{
  public isModuleResolver = true

  protected internalResolver: XyoModuleResolver<TModule>
  private _archivist?: Module

  protected constructor(params: XyoModuleParams<TConfig>, internalResolver?: XyoModuleResolver<TModule>) {
    super(params)
    this.internalResolver = internalResolver ?? new XyoModuleResolver<TModule>()
  }

  static override async create(params?: Partial<XyoModuleParams<NodeConfig>>): Promise<XyoNode> {
    return (await super.create(params)) as XyoNode
  }

  async attached(): Promise<string[]> {
    return (await this.attachedModules()).map((module) => module.address)
  }

  async attachedModules(): Promise<TModule[]> {
    return await (this.internalResolver.resolve() ?? [])
  }

  public async getArchivist(): Promise<Module> {
    if (!this._archivist) {
      this._archivist =
        this._archivist ??
        (this.config?.archivist ? ((await this.resolver?.resolve({ address: [this.config?.archivist] })) ?? []).shift() : undefined) ??
        (await XyoMemoryArchivist.create())
    }
    return this._archivist
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoNodeQuery>(query)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))

    const queryAccount = new XyoAccount()
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
    await this.storeInstanceData()
    return this
  }

  unregister(_module: TModule): void {
    throw new Error('Method not implemented.')
  }

  private async storeInstanceData() {
    const payload = { address: this.address, queries: this.queries, schema: XyoModuleInstanceSchema }
    const [bw] = await this.bindResult([payload])
    await new XyoArchivistWrapper(await this.getArchivist()).insert([bw, payload])
  }

  abstract attach(_address: string): void
  abstract detach(_address: string): void
  abstract resolve(_filter?: ModuleFilter): Promisable<TModule[]>
}
