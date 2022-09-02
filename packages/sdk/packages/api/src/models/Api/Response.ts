import { AxiosResponse } from 'axios'

import { XyoApiEnvelope } from './Envelope'

export type XyoApiResponse<T = unknown, D = unknown> = AxiosResponse<T, D>

export type XyoApiResponseBody<T> = T | undefined

export type XyoApiResponseTuple<T> = [T | undefined, XyoApiEnvelope<T | undefined>, XyoApiResponse<XyoApiEnvelope<T | undefined>>]

export type XyoApiResponseTupleOrBody<T> = XyoApiResponseTuple<T> | XyoApiResponseBody<T>

export type XyoApiResponseType = 'body' | 'tuple'
