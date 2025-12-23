import { isString } from '@xylabs/sdk-js'

export class RemoteDivinerError extends Error {
  isRemoteDivinerError = true
  constructor(action: string, error: Error['cause'], message?: string) {
    const messageString = isString(message) ? ` (${message})` : ''
    super(`Remote Diviner [${action}] failed${messageString}`, { cause: error })
  }

  static isRemoteDivinerError(error: unknown): RemoteDivinerError | undefined {
    return (error as RemoteDivinerError).isRemoteDivinerError ? (error as RemoteDivinerError) : undefined
  }
}
