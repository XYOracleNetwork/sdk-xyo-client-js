import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { XyoApiConfig, XyoApiResponseBody } from '@xyo-network/api-models'
import {
  AbstractModule,
  AbstractModuleConfigSchema,
  creatable,
  isQuerySupportedByModule,
  Module,
  ModuleDescription,
  ModuleParams,
  ModuleQueryResult,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
export interface HttpProxyModuleParams extends ModuleParams {
  address?: string
  api?: XyoArchivistApi
  apiConfig: XyoApiConfig
  name?: string
}

@creatable()
export class HttpProxyModule extends AbstractModule {
  static configSchema = AbstractModuleConfigSchema
  protected readonly _address: string
  protected readonly _api: XyoArchivistApi

  protected _queries: string[] | undefined

  protected constructor(params: HttpProxyModuleParams) {
    super(params)
    this._api = assertEx(params.api, 'Missing param [api]')
    this._address = assertEx(params.address, 'Missing param [address]')
  }

  public get address(): string {
    return this._address
  }

  static async create(params: HttpProxyModuleParams): Promise<HttpProxyModule> {
    const { address, apiConfig, name } = params
    const api = new XyoArchivistApi(apiConfig)
    let description: XyoApiResponseBody<ModuleDescription>
    if (address) {
      description = await api.addresses.address(address).get()
    } else if (name) {
      description = (await api.node(name).get()) as unknown as XyoApiResponseBody<ModuleDescription>
    } else {
      description = await api.get()
    }
    const addr = assertEx(description?.address)
    const instance = new this({ ...params, address: addr, api })
    instance._queries = assertEx(description?.queries, 'Error obtaining module description')

    return instance
  }
  public as<TModule extends Module = Module>(): TModule {
    return this as unknown as TModule
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
  public queryable<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): boolean {
    return isQuerySupportedByModule(this, query, payloads)
  }
}
