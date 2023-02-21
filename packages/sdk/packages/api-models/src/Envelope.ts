import { XyoApiError } from './Error'
import { XyoApiWarning } from './Warning'

export interface XyoApiEnvelopeBase {
  meta: unknown
  warning?: XyoApiWarning[]
}

export interface XyoApiEnvelopeSuccess<T> extends XyoApiEnvelopeBase {
  data: T
  errors: never
}

export interface XyoApiEnvelopeError extends XyoApiEnvelopeBase {
  data: never
  errors: XyoApiError[]
}

export type XyoApiEnvelope<T> = XyoApiEnvelopeSuccess<T> | XyoApiEnvelopeError
