import { AxiosError } from '@xyo-network/axios'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiError<T = any, D = any> extends AxiosError<T, D> {
  isXyoError: true
}
