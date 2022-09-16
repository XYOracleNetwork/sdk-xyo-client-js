export class RemoteArchivistError extends Error {
  constructor(action: string, error: Error['cause'], message?: string) {
    super(`Remote Archivist [${action}] failed${message ? ` (${message})` : ''}`, { cause: error })
  }
  isRemoteArchivistError = true
  static isRemoteArchivistError(error: unknown): RemoteArchivistError | undefined {
    return (error as RemoteArchivistError).isRemoteArchivistError ? (error as RemoteArchivistError) : undefined
  }
}
