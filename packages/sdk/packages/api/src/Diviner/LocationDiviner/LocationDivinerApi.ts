import { ApiConfig } from '@xyo-network/api-models'
import { axios, RawAxiosRequestConfig } from '@xyo-network/axios'

import { getLocationDivinerApiResponseTransformer } from './LocationDivinerApiResponseTransformer'
import { GetLocationQueryResponse } from './models'
import { LocationQueryCreationResponse, SupportedLocationQueryCreationRequest } from './Queries'

class LocationDivinerApi {
  config: ApiConfig
  constructor(config: ApiConfig) {
    this.config = config
  }

  private get axiosRequestConfig(): RawAxiosRequestConfig {
    return {
      transformResponse: getLocationDivinerApiResponseTransformer(),
    }
  }

  async getLocationQuery(hash: string) {
    return (await axios.get<GetLocationQueryResponse>(`${this.config.apiDomain}/location/query/${hash}`, this.axiosRequestConfig)).data
  }

  async postLocationQuery(request: SupportedLocationQueryCreationRequest) {
    return (await axios.post<LocationQueryCreationResponse>(`${this.config.apiDomain}/location/query`, { ...request }, this.axiosRequestConfig)).data
  }
}

export { LocationDivinerApi }
