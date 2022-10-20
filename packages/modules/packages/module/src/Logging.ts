import { getFunctionName, Logger } from '@xyo-network/shared'

export class Logging implements Logger {
  private _logger: Logger
  private _id?: string

  public set id(id: string) {
    this._id = id
  }

  constructor(logger: Logger, id?: string) {
    this._logger = logger
    this._id = id
  }

  private generate(message?: unknown, tag?: string) {
    return `${tag} ${this._id ? `[${this._id}] ` : ''}${
      typeof message === 'string' ? message : typeof message === 'object' ? JSON.stringify(message, null, 2) : `${message}`
    }`
  }

  debug(message?: unknown) {
    this._logger?.log(this.generate(message, getFunctionName(3)))
  }
  error(message?: unknown) {
    this._logger?.log(this.generate(message, getFunctionName(3)))
  }
  info(message?: unknown) {
    this._logger?.log(this.generate(message, getFunctionName(3)))
  }
  log(message?: unknown) {
    this._logger?.log(this.generate(message, getFunctionName(3)))
  }
  warn(message?: unknown) {
    this._logger?.log(this.generate(message, getFunctionName(3)))
  }
}
