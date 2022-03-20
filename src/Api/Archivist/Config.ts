import { ApiConfig } from '@xylabs/sdk-js'

interface XyoArchivistApiConfig extends ApiConfig {
  authPrefix?: string
  root?: string
}

export type { XyoArchivistApiConfig }
