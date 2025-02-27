import type { ApiError } from './Error.ts'
import type { ApiResponse } from './Response.ts'

export interface ApiReportable {
  onError?: (error: ApiError, depth: number) => void

  onFailure?: (response: ApiResponse, depth: number) => void

  onSuccess?: (response: ApiResponse, depth: number) => void
}
