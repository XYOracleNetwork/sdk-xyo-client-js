import { Hash } from '@xylabs/hex'
import { JsonValue } from '@xylabs/object'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  ModuleError, ModuleErrorSchema, WithOptionalSources,
} from '@xyo-network/payload-model'

export class ModuleErrorBuilder extends PayloadBuilder<WithOptionalSources<ModuleError>> {
  _details?: JsonValue
  _message?: string
  _name?: string
  _query?: Hash
  constructor() {
    super({ schema: ModuleErrorSchema })
  }

  override build(): WithOptionalSources<ModuleError> {
    this.fields({
      details: this._details,
      message: this._message,
      name: this._name,
      query: this._query,
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
}
