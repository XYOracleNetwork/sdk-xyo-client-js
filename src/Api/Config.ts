import { ApiConfig } from '@xylabs/sdk-js'

interface XyoApiConfig extends ApiConfig {
  authPrefix?: string
  root?: string
}

export type { XyoApiConfig }
