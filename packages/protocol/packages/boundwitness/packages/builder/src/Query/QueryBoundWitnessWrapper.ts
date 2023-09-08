import { assertEx } from '@xylabs/assert'
import { compact } from '@xylabs/lodash'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { PayloadHasher } from '@xyo-network/core'
import { Payload, PayloadSetPayload, Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { QueryBoundWitness } from './QueryBoundWitness'
import { QueryBoundWitnessValidator } from './QueryBoundWitnessValidator'

export class QueryBoundWitnessWrapper<T extends Query = Query> extends BoundWitnessWrapper<QueryBoundWitness> {
  private _payloadsWithoutQuery: PayloadWrapper<Payload>[] | undefined
  private _query: T | undefined
  private _resultSet: PayloadSetPayload | undefined

  private isQueryBoundWitnessWrapper = true

  static parseQuery<T extends Query = Query>(obj: unknown, payloads?: Payload[]): QueryBoundWitnessWrapper<T> {
    assertEx(!Array.isArray(obj), 'Array can not be converted to QueryBoundWitnessWrapper')
    switch (typeof obj) {
      case 'object': {
        const castWrapper = obj as QueryBoundWitnessWrapper<T>
        const wrapper = castWrapper?.isQueryBoundWitnessWrapper ? castWrapper : new QueryBoundWitnessWrapper<T>(obj as QueryBoundWitness, payloads)
        /*if (!wrapper.valid) {
          console.warn(`Parsed invalid QueryBoundWitness ${JSON.stringify(wrapper.errors.map((error) => error.message))}`)
        }*/
        return wrapper
      }
    }
    throw Error(`Unable to parse [${typeof obj}]`)
  }

  override getErrors() {
    return new QueryBoundWitnessValidator(this.boundwitness).validate()
  }

  async getQuery(): Promise<T> {
    const payloadMap = await this.allPayloadMap()
    this._query = this._query ?? (payloadMap[this.boundwitness.query] as T | undefined)
    return assertEx(this._query, `Missing Query [${this.boundwitness}]`)
  }

  async getResultSet() {
    const resultSetHash = this.boundwitness.resultSet
    const payloadMap = await this.payloadMap()
    return assertEx(
      (this._resultSet = this._resultSet ?? (resultSetHash ? (payloadMap[resultSetHash] as PayloadSetPayload | undefined) : undefined)),
      `Missing resultSet [${resultSetHash}]`,
    )
  }

  override async getWrappedPayloads(): Promise<PayloadWrapper<Payload>[]> {
    this._payloadsWithoutQuery =
      this._payloadsWithoutQuery ??
      compact(
        (
          await PayloadHasher.filterExclude(
            (await super.getWrappedPayloads()).map((wrapper) => wrapper.payload()),
            this.payload().query,
          )
        ).map((payload) => PayloadWrapper.wrap(payload)),
      )
    return this._payloadsWithoutQuery
  }
}
