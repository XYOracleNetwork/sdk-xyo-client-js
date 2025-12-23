import type { JsonValue } from '@xylabs/sdk-js'

export class ModuleDetailsError extends Error {
  details?: JsonValue
  constructor(
    message: string,
    details?: JsonValue,
  ) {
    super(message)
    this.details = details
    this.name = 'ModuleError'
  }
}
