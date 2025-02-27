import type { ApiError } from './Error.ts'
import type { ApiWarning } from './Warning.ts'

export interface ApiEnvelopeBase {
  warning?: ApiWarning[]
}

export interface ApiEnvelopeSuccess<T> extends ApiEnvelopeBase {
  data: T
  errors: never
}

export interface ApiEnvelopeError extends ApiEnvelopeBase {
  data: never
  errors: ApiError[]
}

export type ApiEnvelope<T> = ApiEnvelopeSuccess<T> | ApiEnvelopeError
