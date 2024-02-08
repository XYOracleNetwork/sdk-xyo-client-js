import { PayloadBuilder } from '@xyo-network/payload-builder'
import { ModuleError, ModuleErrorSchema, WithMeta } from '@xyo-network/payload-model'

export class ModuleErrorBuilder extends PayloadBuilder<ModuleError> {
  _message?: string
  _name?: string
  _query?: string
  _sources?: string[]
  constructor() {
    super({ schema: ModuleErrorSchema })
  }

  override build(): Promise<WithMeta<ModuleError>> {
    this.fields({
      message: this._message,
      name: this._name,
      query: this._query,
      schema: ModuleErrorSchema,
      sources: this._sources,
    })
    return super.build()
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
