import { axios, AxiosRequestConfig } from '@xyo-network/axios'

import { ApiConfig } from './ApiConfig'
import { getLocationDivinerApiResponseTransformer } from './LocationDivinerApiResponseTransformer'
import { GetLocationQueryResponse } from './models'
import { LocationQueryCreationResponse, SupportedLocationQueryCreationRequest } from './Queries'

class XyoLocationDivinerApi {
  public config: ApiConfig
  constructor(config: ApiConfig) {
    this.config = config
  }

  private get axiosRequestConfig(): AxiosRequestConfig {
    return {
      transformResponse: getLocationDivinerApiResponseTransformer(),
    }
  }

  public async getLocationQuery(hash: string) {
    return (await axios.get<GetLocationQueryResponse>(`${this.config.apiDomain}/location/query/${hash}`, this.axiosRequestConfig)).data
  }

  public async postLocationQuery(request: SupportedLocationQueryCreationRequest) {
    return (await axios.post<LocationQueryCreationResponse>(`${this.config.apiDomain}/location/query`, { ...request }, this.axiosRequestConfig)).data
  }
}

export { XyoLocationDivinerApi }
