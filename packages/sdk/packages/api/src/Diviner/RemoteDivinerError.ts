export class RemoteDivinerError extends Error {
  isRemoteDivinerError = true
  constructor(action: string, error: Error['cause'], message?: string) {
    super(`Remote Diviner [${action}] failed${message ? ` (${message})` : ''}`, { cause: error })
  }
  static isRemoteDivinerError(error: unknown): RemoteDivinerError | undefined {
    return (error as RemoteDivinerError).isRemoteDivinerError ? (error as RemoteDivinerError) : undefined
  }
}
