import { XyoArchivistApi } from '@xyo-network/api'
import { Module, ModuleDescription, ModuleQueryResult, ModuleResolver, ModuleWrapper, XyoModule, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadFields, SchemaFields, XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

export class RemoteModule<TModule extends Module = Module> implements Module {
  protected constructor(protected readonly _api: XyoArchivistApi) {
    // TODO: API
  }

  public get address(): string {
    throw new Error('Not Implemented')
  }
  public get api(): XyoArchivistApi {
    if (this._api) {
      return this._api
    }
    throw Error('No API specified')
  }
  public get config(): SchemaFields & PayloadFields & { schema: string } {
    throw new Error('Not Implemented')
  }
  public description(): Promisable<ModuleDescription, never> {
    throw new Error('Not Implemented')
  }
  public queries() {
    return [] as string[]
  }
  async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    await Promise.resolve()
    throw new Error('Not Implemented')
  }
  public queryable(schema: string, addresses?: string[] | undefined) {
    return false
  }
}
