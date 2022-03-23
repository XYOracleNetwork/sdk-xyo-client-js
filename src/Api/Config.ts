import { ApiConfig } from '@xylabs/sdk-js'
import { AxiosError, AxiosResponse } from 'axios'

interface XyoApiConfig extends ApiConfig {
  authPrefix?: string
  root?: string
  onError?: (error: AxiosError) => void
  onFailure?: (response: AxiosResponse) => void
}

export type { XyoApiConfig }
