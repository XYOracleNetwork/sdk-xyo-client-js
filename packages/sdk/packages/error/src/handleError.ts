import { isError } from './isError'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleError = <T>(error: any, handler: (error: Error) => T) => {
  if (isError(error)) {
    return handler(error)
  } else {
    throw error
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleErrorAsync = async <T>(error: any, handler: (error: Error) => Promise<T>) => {
  if (isError(error)) {
    return await handler(error)
  } else {
    throw error
  }
}
