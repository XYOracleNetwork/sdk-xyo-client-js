import { ApiConfig } from '@xylabs/sdk-js'
import { Axios, AxiosRequestConfig } from 'axios'

interface XyoArchivistApiConfig extends ApiConfig {
  archive: string
  axios?: Axios
  axiosRequestConfig?: AxiosRequestConfig
}

export type { XyoArchivistApiConfig }
