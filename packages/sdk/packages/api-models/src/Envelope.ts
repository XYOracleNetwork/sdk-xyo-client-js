import { ApiError } from './Error'
import { ApiWarning } from './Warning'

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
