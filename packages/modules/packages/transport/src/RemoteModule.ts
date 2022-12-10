import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { creatable, Module, ModuleDescription, ModuleQueryResult, XyoModuleConfig, XyoModuleParams, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export interface RemoteModuleParams extends XyoModuleParams {
  address: string
  api: XyoArchivistApi
}

@creatable()
export class RemoteModule implements Module {
  protected _config: XyoModuleConfig | undefined
  protected _queries: string[] | undefined

  protected constructor(protected readonly _api: XyoArchivistApi, protected readonly _address: string) {}

  public get address(): string {
    return this._address
  }
  public get api(): XyoArchivistApi {
    return this._api
  }
  public get config(): XyoModuleConfig {
    if (!this._config) throw new Error('Missing config')
    return this._config
  }

  static create(params: RemoteModuleParams): Promise<RemoteModule> {
    const { address, api } = params
    // TODO: Hydrate config/queries/etc
    return Promise.resolve(new this(api, address))
  }

  public async description(): Promise<ModuleDescription> {
    return assertEx(await this._api.addresses.address(this.address).get())
  }
  public queries(): string[] {
    if (!this._queries) throw new Error('Missing queries')
    return this._queries
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
