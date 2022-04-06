import { XyoApiError } from './Error'
import { XyoApiResponse } from './Response'

export interface XyoApiReportable {
  onError(error: XyoApiError, depth: number): void

  onFailure(response: XyoApiResponse, depth: number): void

  onSuccess(response: XyoApiResponse, depth: number): void
}
