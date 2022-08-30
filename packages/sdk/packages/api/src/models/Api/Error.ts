import { AxiosError } from 'axios'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface XyoApiError<T = any, D = any> extends AxiosError<T, D> {
  isXyoError: true
}
