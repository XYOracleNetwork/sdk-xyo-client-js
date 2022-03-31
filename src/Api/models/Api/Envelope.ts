import { XyoApiError } from './Error'
import { XyoApiWarning } from './Warning'

export interface XyoApiEnvelopeBase {
  warning?: XyoApiWarning[]
}

export interface XyoApiEnvelopeSuccess<T> extends XyoApiEnvelopeBase {
  data: T
  error: never
}

export interface XyoApiEnvelopeError extends XyoApiEnvelopeBase {
  data: never
  error: XyoApiError[]
}

export type XyoApiEnvelope<T> = XyoApiEnvelopeSuccess<T> | XyoApiEnvelopeError
