import { assertEx } from '@xylabs/assert'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { Query, QueryBoundWitness } from '@xyo-network/module-model'
import { Payload, PayloadSetPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { QueryBoundWitnessValidator } from './QueryBoundWitnessValidator'

export class QueryBoundWitnessWrapper<T extends Query = Query> extends BoundWitnessWrapper<QueryBoundWitness> {
  private _payloadsWithoutQuery: PayloadWrapper<Payload>[] | undefined
  private _query: T | undefined
  private _resultSet: PayloadSetPayload | undefined

  static override is(obj: unknown) {
    return obj instanceof QueryBoundWitnessWrapper
  }

  static async parseQuery<T extends Query = Query>(obj: unknown, payloads?: Payload[]): Promise<QueryBoundWitnessWrapper<T>> {
    assertEx(!Array.isArray(obj), 'Array can not be converted to QueryBoundWitnessWrapper')
    switch (typeof obj) {
      case 'object': {
        const wrapper = QueryBoundWitnessWrapper.is(obj)
          ? (obj as QueryBoundWitnessWrapper<T>)
          : new QueryBoundWitnessWrapper<T>(obj as QueryBoundWitness, payloads)
        if (!(await wrapper.getValid())) {
          console.warn(`Parsed invalid QueryBoundWitness ${JSON.stringify((await wrapper.getErrors()).map((error) => error.message))}`)
        }
        return wrapper
      }
    }
    throw Error(`Unable to parse [${typeof obj}]`)
  }

  override getErrors() {
    return new QueryBoundWitnessValidator(this.boundwitness).validate()
  }

  async getQuery(): Promise<T> {
    const payloadMap = await this.payloadMap()
    this._query = this._query ?? (payloadMap[this.boundwitness.query] as unknown as T | undefined)
    return assertEx(this._query, `Missing Query [${this.boundwitness}]`)
  }

  async getResultSet() {
    const resultSetHash = this.boundwitness.resultSet
    const payloadMap = await this.payloadMap()
    return assertEx(
      (this._resultSet = this._resultSet ?? (resultSetHash ? (payloadMap[resultSetHash] as unknown as PayloadSetPayload | undefined) : undefined)),
      `Missing resultSet [${resultSetHash}]`,
    )
  }

  override async getWrappedPayloads(): Promise<PayloadWrapper<Payload>[]> {
    this._payloadsWithoutQuery =
      this._payloadsWithoutQuery ??
      (
        await Promise.all(
          (await super.getWrappedPayloads()).map<Promise<[string, PayloadWrapper]>>(async (payload) => [await payload.hashAsync(), payload]),
        )
      )
        .filter(([hash]) => hash !== this.payload().query)
        .map<PayloadWrapper>(([_, payload]) => payload)
    return this._payloadsWithoutQuery
  }
}
