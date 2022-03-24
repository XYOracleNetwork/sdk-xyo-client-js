import { ApiConfig } from '@xylabs/sdk-js'

import { XyoApiError } from './Error'
import { XyoApiResponse } from './Response'

interface XyoApiConfig extends ApiConfig {
  authPrefix?: string
  root?: string
  onError?: (error: XyoApiError) => void
  onFailure?: (response: XyoApiResponse) => void
  onSuccess?: (response: XyoApiResponse) => void
}

export type { XyoApiConfig }
