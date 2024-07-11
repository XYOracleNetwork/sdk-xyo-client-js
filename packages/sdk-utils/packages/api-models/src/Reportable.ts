import { ApiError } from './Error.js'
import { ApiResponse } from './Response.js'

export interface ApiReportable {
  onError?: (error: ApiError, depth: number) => void

  onFailure?: (response: ApiResponse, depth: number) => void

  onSuccess?: (response: ApiResponse, depth: number) => void
}
