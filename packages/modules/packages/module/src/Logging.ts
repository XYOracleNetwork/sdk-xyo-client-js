import { getFunctionName, Logger } from '@xyo-network/shared'

export class Logging implements Logger {
  private _id?: string
  private _logger: Logger

  constructor(logger: Logger, id?: string) {
    this._logger = logger
    this._id = id
  }

  public set id(id: string) {
    this._id = id
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

  private generate(message?: unknown, tag?: string) {
    return `${tag} ${this._id ? `[${this._id}] ` : ''}${
      typeof message === 'string' ? message : typeof message === 'object' ? JSON.stringify(message, null, 2) : `${message}`
    }`
  }
}
