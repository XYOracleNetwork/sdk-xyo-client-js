import { Logger } from '@xyo-network/shared'

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

  debug(message?: unknown, tag?: string) {
    this._logger?.log(this.generate(message, tag))
  }
  error(message?: unknown, tag?: string) {
    this._logger?.log(this.generate(message, tag))
  }
  info(message?: unknown, tag?: string) {
    this._logger?.log(this.generate(message, tag))
  }
  log(message?: unknown, tag?: string) {
    this._logger?.log(this.generate(message, tag))
  }
  warn(message?: unknown, tag?: string) {
    this._logger?.log(this.generate(message, tag))
  }
}
