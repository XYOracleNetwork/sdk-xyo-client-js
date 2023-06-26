import { ModuleError, ModuleErrorSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'

export class ModuleErrorBuilder extends PayloadBuilder {
  _message?: string
  _name?: string
  _query?: string
  _sources?: string[]
  constructor() {
    super({ schema: ModuleErrorSchema })
  }

  override build(): ModuleError {
    return {
      message: this._message,
      name: this._name,
      query: this._query,
      schema: ModuleErrorSchema,
      sources: this._sources,
    }
  }

  message(message: string) {
    this._message = message
    return this
  }

  name(name: string) {
    this._name = name
    return this
  }

  query(query: string) {
    this._query = query
    return this
  }

  sources(sources: string[]) {
    this._sources = sources
    return this
  }
}
