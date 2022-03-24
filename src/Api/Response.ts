import { AxiosResponse } from 'axios'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type XyoApiResponse<T = any, D = any> = AxiosResponse<T, D>
