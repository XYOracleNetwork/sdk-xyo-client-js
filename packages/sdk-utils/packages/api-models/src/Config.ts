import { ApiReportable } from './Reportable'

interface ApiConfig extends ApiReportable {
  /** @description The domain where the api is located */
  apiDomain: string

  /** @description The apiKey used for authentication */
  apiKey?: string

  /** @description Threshold for Content-Size to cause automatic gzip of request body [default = 1024] */
  compressionThreshold?: number

  /** @description The jwtToken of the currently logged in user */
  jwtToken?: string

  /** @description The query string, if any, that is added to the end of every request */
  query?: string

  /** @description Parent that should also report events from this api */
  reportableParent?: ApiReportable

  /** @description The location in the API tree where this API object is mounted */
  root?: string

  /** @description Throw on error */
  throwError?: boolean

  /** @description Throw on failures */
  throwFailure?: boolean

  /** @deprecated use the jwtToken instead*/
  userid?: string
}

export type { ApiConfig }
