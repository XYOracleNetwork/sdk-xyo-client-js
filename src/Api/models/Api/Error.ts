import { AxiosError } from 'axios'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type XyoApiError<T = any, D = any> = AxiosError<T, D>
