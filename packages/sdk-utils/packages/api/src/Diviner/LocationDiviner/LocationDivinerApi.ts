import { axios, RawAxiosRequestConfig } from '@xylabs/axios'
import { ApiConfig } from '@xyo-network/api-models'

import { getLocationDivinerApiResponseTransformer } from './LocationDivinerApiResponseTransformer.js'
import { GetLocationQueryResponse } from './models.js'
import { LocationQueryCreationResponse, SupportedLocationQueryCreationRequest } from './Queries/index.js'

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
