import { XyoApiError, XyoApiResponse } from './models'

export interface XyoApiReportable {
  onError(error: XyoApiError, depth: number): void

  onFailure(response: XyoApiResponse, depth: number): void

  onSuccess(response: XyoApiResponse, depth: number): void
}
