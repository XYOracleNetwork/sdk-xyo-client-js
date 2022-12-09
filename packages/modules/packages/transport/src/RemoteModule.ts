import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { Module, ModuleDescription, ModuleQueryResult, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadFields, SchemaFields, XyoPayload } from '@xyo-network/payload'

export class RemoteModule implements Module {
  constructor(protected readonly _api: XyoArchivistApi, protected readonly _address: string) {}

  // TODO: async create (without XyoModule)

  public get address(): string {
    return this._address
  }
  public get api(): XyoArchivistApi {
    return this._api
  }
  public get config(): SchemaFields & PayloadFields & { schema: string } {
    throw new Error('Not Implemented')
  }
  public async description(): Promise<ModuleDescription> {
    return assertEx(await this._api.addresses.address(this.address).get())
  }
  public queries(): string[] {
    return []
  }
  async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    const data = payloads?.length ? [query, payloads] : [query]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this._api.addresses.address(this.address).post(data as any)
    return response as unknown as ModuleQueryResult
  }
  public queryable(_schema: string, _addresses?: string[] | undefined) {
    return true
  }
}
