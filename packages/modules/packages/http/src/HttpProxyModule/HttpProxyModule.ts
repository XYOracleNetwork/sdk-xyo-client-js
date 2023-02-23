import { assertEx } from '@xylabs/assert'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { XyoArchivistApi } from '@xyo-network/api'
import { XyoApiConfig, XyoApiResponseBody } from '@xyo-network/api-models'
import {
  AbstractModule,
  creatable,
  isQuerySupportedByModule,
  Module,
  ModuleParams,
  ModuleQueryResult,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

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

  public override get queries(): string[] {
    if (!this._queries) throw new Error('Missing queries')
    return this._queries
  }

  static async create(params: HttpProxyModuleParams): Promise<HttpProxyModule> {
    const { config, apiConfig, name } = params
    const { address: remoteAddress } = config
    const api = new XyoArchivistApi(apiConfig)
    let description: XyoApiResponseBody<XyoPayloads> = []
    if (remoteAddress) {
      description = await api.addresses.address(remoteAddress).get()
    } else if (name) {
      description = (await api.node(name).get()) as unknown as XyoApiResponseBody<XyoPayloads>
    } else {
      description = await api.get()
    }
    const addressPayload = description?.find((p) => p.schema === AddressSchema) as AddressPayload
    const address = assertEx(addressPayload?.address, 'Error obtaining module address')
    const instance = new this({ ...params, api, apiConfig, config: { ...config, address }, name })
    const queryPayloads = description?.filter((p) => p.schema === QuerySchema) as QueryPayload[]
    const queries = queryPayloads?.map((p) => p.query)
    instance._queries = assertEx(queries, 'Error obtaining module description')

    return instance
  }
  public as<TModule extends Module = Module>(): TModule {
    return this as unknown as TModule
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
