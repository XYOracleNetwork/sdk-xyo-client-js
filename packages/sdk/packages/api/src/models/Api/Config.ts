import { XyoApiReportable } from './Reportable'

interface XyoApiConfig extends XyoApiReportable {
  /** @description The domain where the api is located */
  apiDomain: string

  /** @deprecated use the jwtToken instead*/
  userid?: string

  /** @description The jwtToken of the currently logged in user */
  jwtToken?: string

  /** @description The apiKey used for authentication */
  apiKey?: string

  /** @description The location in the API tree where this API object is mounted */
  root?: string

  /** @description The query string, if any, that is added to the end of every request */
  query?: string

  /** @description Threshold for Content-Size to cause automatic gzip of request body [default = 1024] */
  compressionThreshold?: number

  /** @description Throw on failures */
  throwFailure?: boolean

  /** @description Throw on error */
  throwError?: boolean

  /** @description Parent that should also report events from this api */
  reportableParent?: XyoApiReportable
}

export type { XyoApiConfig }
