import { JsonValue } from '@xylabs/object'

export class ModuleDetailsError extends Error {
  constructor(
    message: string,
    public details?: JsonValue,
  ) {
    super(message)
    this.name = 'ModuleError'
  }
}
