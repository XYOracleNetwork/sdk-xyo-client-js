import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { XyoApiConfig } from '@xyo-network/api-models'
import {
  AbstractModuleConfig,
  AbstractModuleConfigSchema,
  creatable,
  Module,
  ModuleDescription,
  ModuleParams,
  ModuleQueryResult,
  ModuleWrapper,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
export interface HttpProxyModuleParams extends ModuleParams {
  address?: string
  apiConfig: XyoApiConfig
}

@creatable()
export class HttpProxyModule implements Module {
  static configSchema = AbstractModuleConfigSchema
  protected _config: AbstractModuleConfig | undefined
  protected _queries: string[] | undefined

  protected constructor(protected readonly _api: XyoArchivistApi, protected readonly _address: string) {}

  public get address(): string {
    return this._address
  }
  public get config(): AbstractModuleConfig {
    if (!this._config) throw new Error('Missing config')
    return this._config
  }
  static async create(params: HttpProxyModuleParams): Promise<HttpProxyModule> {
    const { address, apiConfig } = params
    const api = new XyoArchivistApi(apiConfig)
    const addr = address || assertEx((await api.get())?.address)
    const instance = new this(api, addr)
    const description = assertEx(await api.addresses.address(addr).get(), 'Error obtaining module description')
    instance._queries = description.queries
    // NOTE: We can't depend on obtaining the config positionally from
    // the response array and we need to filter on a result that is a
    // config schema (of which there are many) so we're left with
    // string matching for now.
    // A brittle alternative would be to pick off all known response
    // fields (address payload, etc.) and use process of elimination
    const discover = await new ModuleWrapper(instance).discover()
    const config = assertEx(
      discover.find((p) => p.schema.toLowerCase().includes('config')),
      'Error obtaining module config',
    )
    instance._config = config
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
  public queryable(schema: string, _addresses?: string[] | undefined) {
    return this.queries().includes(schema)
  }
}
