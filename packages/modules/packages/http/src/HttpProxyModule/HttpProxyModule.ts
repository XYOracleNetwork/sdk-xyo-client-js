import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { XyoApiConfig, XyoApiResponseBody } from '@xyo-network/api-models'
import {
  AbstractModule,
  creatable,
  isQuerySupportedByModule,
  Module,
  ModuleDescription,
  ModuleParams,
  ModuleQueryResult,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

import { HttpProxyModuleConfig, HttpProxyModuleConfigSchema } from './Config'
export interface HttpProxyModuleParams extends ModuleParams<HttpProxyModuleConfig> {
  api?: XyoArchivistApi
  apiConfig: XyoApiConfig
  name?: string
}

@creatable()
export class HttpProxyModule extends AbstractModule<HttpProxyModuleConfig> {
  static configSchema = HttpProxyModuleConfigSchema
  protected readonly _api: XyoArchivistApi

  protected _queries: string[] | undefined

  protected constructor(params: HttpProxyModuleParams) {
    super(params)
    this._api = assertEx(params.api, 'Missing param [api]')
  }

  public override get address(): string {
    return assertEx(this.config.address, 'missing remote address')
  }

  static async create(params: HttpProxyModuleParams): Promise<HttpProxyModule> {
    const { config, apiConfig, name } = params
    const { address: remoteAddress } = config
    const api = new XyoArchivistApi(apiConfig)
    let description: XyoApiResponseBody<ModuleDescription>
    if (remoteAddress) {
      description = await api.addresses.address(remoteAddress).get()
    } else if (name) {
      description = (await api.node(name).get()) as unknown as XyoApiResponseBody<ModuleDescription>
    } else {
      description = await api.get()
    }
    const address = assertEx(description?.address)
    const instance = new this({ ...params, api, apiConfig, config: { ...config, address }, name })
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
