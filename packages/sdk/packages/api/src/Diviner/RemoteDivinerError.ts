export class RemoteDivinerError extends Error {
  constructor(action: string, error: Error['cause'], message?: string) {
    super(`Remote Diviner [${action}] failed${message ? ` (${message})` : ''}`, { cause: error })
  }
  isRemoteDivinerError = true
  static isRemoteDivinerError(error: unknown): RemoteDivinerError | undefined {
    return (error as RemoteDivinerError).isRemoteDivinerError ? (error as RemoteDivinerError) : undefined
  }
}
