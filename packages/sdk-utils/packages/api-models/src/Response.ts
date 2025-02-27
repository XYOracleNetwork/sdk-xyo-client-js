import type { AxiosResponse } from 'axios'

import type { ApiEnvelope } from './Envelope.ts'

export type ApiResponse<T = unknown, D = unknown> = AxiosResponse<T, D>

export type ApiResponseBody<T> = T | undefined

export type ApiResponseTuple<T> = [T | undefined, ApiEnvelope<T | undefined>, ApiResponse<ApiEnvelope<T | undefined>>]

export type ApiResponseTupleOrBody<T> = ApiResponseTuple<T> | ApiResponseBody<T>

export type ApiResponseType = 'body' | 'tuple'
