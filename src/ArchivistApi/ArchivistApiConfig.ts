import { ApiConfig } from '@xylabs/sdk-js'
import { Axios } from 'axios'

interface XyoArchivistApiConfig extends ApiConfig {
  archive: string
  axios?: Axios
}

export type { XyoArchivistApiConfig }
