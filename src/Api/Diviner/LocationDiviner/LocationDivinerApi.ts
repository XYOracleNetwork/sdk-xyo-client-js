import { ApiConfig } from '@xylabs/sdk-js'
import axios, { AxiosRequestConfig } from 'axios'

import { getLocationDivinerApiResponseTransformer } from './LocationDivinerApiResponseTransformer'
import { GetLocationQueryResponse } from './models'
import { LocationQueryCreationRequest, LocationQueryCreationResponse } from './Queries'

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
    return (
      await axios.get<GetLocationQueryResponse>(
        `${this.config.apiDomain}/location/query/${hash}`,
        this.axiosRequestConfig
      )
    ).data
  }

  public async postLocationQuery(request: LocationQueryCreationRequest) {
    return (
      await axios.post<LocationQueryCreationResponse>(
        `${this.config.apiDomain}/location/query`,
        { ...request },
        this.axiosRequestConfig
      )
    ).data
  }
}

export { XyoLocationDivinerApi }
