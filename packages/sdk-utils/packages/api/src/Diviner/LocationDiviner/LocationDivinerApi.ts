import { axiosJson } from '@xylabs/sdk-js'
import type { ApiConfig } from '@xyo-network/api-models'
import type { RawAxiosRequestConfig } from 'axios'

import { getLocationDivinerApiResponseTransformer } from './LocationDivinerApiResponseTransformer.ts'
import type { GetLocationQueryResponse } from './models.ts'
import type { LocationQueryCreationResponse, SupportedLocationQueryCreationRequest } from './Queries/index.ts'

class LocationDivinerApi {
  config: ApiConfig
  constructor(config: ApiConfig) {
    this.config = config
  }

  private get axiosRequestConfig(): RawAxiosRequestConfig {
    return { transformResponse: getLocationDivinerApiResponseTransformer() }
  }

  async getLocationQuery(hash: string) {
    return (await axiosJson.get<GetLocationQueryResponse>(`${this.config.apiDomain}/location/query/${hash}`, this.axiosRequestConfig)).data
  }

  async postLocationQuery(request: SupportedLocationQueryCreationRequest) {
    return (await axiosJson.post<LocationQueryCreationResponse>(`${this.config.apiDomain}/location/query`, { ...request }, this.axiosRequestConfig)).data
  }
}

export { LocationDivinerApi }
