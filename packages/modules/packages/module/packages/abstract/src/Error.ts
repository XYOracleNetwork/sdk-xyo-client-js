import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

export type ModuleErrorSchema = 'network.xyo.error.module'
export const ModuleErrorSchema: ModuleErrorSchema = 'network.xyo.error.module'

export type ModuleError = Payload<{ message?: string; schema: ModuleErrorSchema; sources?: string[] }>

export class ModuleErrorBuilder extends PayloadBuilder {
  _message?: string
  _sources?: string[]
  constructor() {
    super({ schema: ModuleErrorSchema })
  }

  override build(): ModuleError {
    return {
      message: this._message,
      schema: ModuleErrorSchema,
      sources: this._sources,
    }
  }

  message(message: string) {
    this._message = message
    return this
  }

  sources(sources: string[]) {
    this._sources = sources
    return this
  }
}
