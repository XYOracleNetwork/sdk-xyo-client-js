import { ApiError } from './Error'
import { ApiResponse } from './Response'

export interface ApiReportable {
  onError?: (error: ApiError, depth: number) => void

  onFailure?: (response: ApiResponse, depth: number) => void

  onSuccess?: (response: ApiResponse, depth: number) => void
}
