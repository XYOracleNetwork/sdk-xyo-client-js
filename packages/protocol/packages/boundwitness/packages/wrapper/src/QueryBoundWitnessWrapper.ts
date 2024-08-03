import { assertEx } from '@xylabs/assert'
import { compact } from '@xylabs/lodash'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload'
import { Payload, Query, WithMeta } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { BoundWitnessWrapper } from './BoundWitnessWrapper.ts'

export class QueryBoundWitnessWrapper<T extends Query = Query> extends BoundWitnessWrapper<QueryBoundWitness> {
  private _payloadsWithoutQuery: PayloadWrapper<Payload>[] | undefined
  private _query: T | undefined

  static async parseQuery<T extends Query = Query>(obj: unknown, payloads?: Payload[]): Promise<QueryBoundWitnessWrapper<T>> {
    assertEx(!Array.isArray(obj), () => 'Array can not be converted to QueryBoundWitnessWrapper')
    switch (typeof obj) {
      case 'object': {
        const castWrapper = obj as QueryBoundWitnessWrapper<T>
        /* if (!wrapper.valid) {
          console.warn(`Parsed invalid QueryBoundWitness ${JSON.stringify(wrapper.errors.map((error) => error.message))}`)
        } */
        return castWrapper instanceof QueryBoundWitnessWrapper
          ? castWrapper
          : (
              new QueryBoundWitnessWrapper<T>(
                await PayloadBuilder.build(obj as QueryBoundWitness),
                payloads ? await Promise.all(payloads.map(payload => PayloadBuilder.build(payload))) : undefined,
              )
            )
      }
    }
    throw new Error(`Unable to parse [${typeof obj}]`)
  }

  async getPayloadsWithoutQuery(): Promise<PayloadWrapper<Payload>[]> {
    this._payloadsWithoutQuery
      = this._payloadsWithoutQuery
      ?? (await Promise.all(
        compact((await PayloadBuilder.filterExclude(this.payloads, this.payload.query)).map(payload => PayloadWrapper.wrap(payload))),
      ))
    return this._payloadsWithoutQuery
  }

  async getQuery(): Promise<T> {
    const payloadMap = await this.payloadsDataHashMap()
    this._query = this._query ?? (payloadMap[this.boundwitness.query] as WithMeta<T> | undefined)
    return assertEx(this._query, () => `Missing Query [${this.boundwitness}]`)
  }
}
