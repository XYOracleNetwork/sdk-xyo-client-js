import type { Hash } from '@xylabs/hex'
import type { JsonValue } from '@xylabs/object'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { ModuleError, WithMeta } from '@xyo-network/payload-model'
import { ModuleErrorSchema } from '@xyo-network/payload-model'

export class ModuleErrorBuilder extends PayloadBuilder<ModuleError> {
  _details?: JsonValue
  _message?: string
  _name?: string
  _query?: Hash
  _sources?: Hash[]
  constructor() {
    super({ schema: ModuleErrorSchema })
  }

  override build(): Promise<WithMeta<ModuleError>> {
    this.fields({
      details: this._details,
      message: this._message,
      name: this._name,
      query: this._query,
      schema: ModuleErrorSchema,
      sources: this._sources,
    })
    return super.build()
  }

  details(details?: JsonValue) {
    this._details = details
    return this
  }

  message(message: string) {
    this._message = message
    return this
  }

  name(name: string) {
    this._name = name
    return this
  }

  query(query: Hash) {
    this._query = query
    return this
  }

  sources(sources: Hash[]) {
    this._sources = sources
    return this
  }
}
