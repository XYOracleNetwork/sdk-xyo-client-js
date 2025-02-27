import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { Promisable } from '@xylabs/promise'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { isQueryBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload'
import type { Payload, Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { BoundWitnessWrapper } from './BoundWitnessWrapper.ts'

export class QueryBoundWitnessWrapper<T extends Query = Query> extends BoundWitnessWrapper<QueryBoundWitness> {
  private _payloadsWithoutQuery: PayloadWrapper<Payload>[] | undefined
  private _query: T | undefined

  static parseQuery<T extends Query = Query>(obj: unknown, payloads?: Payload[]): QueryBoundWitnessWrapper<T> {
    assertEx(!Array.isArray(obj), () => 'Array can not be converted to QueryBoundWitnessWrapper')
    switch (typeof obj) {
      case 'object': {
        const castWrapper = obj as QueryBoundWitnessWrapper<T>
        /* if (!wrapper.valid) {
          console.warn(`Parsed invalid QueryBoundWitness ${JSON.stringify(wrapper.errors.map((error) => error.message))}`)
        } */
        const result = castWrapper instanceof QueryBoundWitnessWrapper
          ? castWrapper
          : isQueryBoundWitness(obj)
            ? (
                new QueryBoundWitnessWrapper<T>(
                  obj,
                  payloads,
                )
              )
            : undefined
        if (result === undefined) {
          throw new Error('Unable to parse. Failed isQueryBoundWitness.')
        }
        return result
      }
    }
    throw new Error(`Unable to parse [${typeof obj}]`)
  }

  static tryParseQuery<T extends Query>(obj: unknown): Promisable<QueryBoundWitnessWrapper<T> | undefined> {
    if (obj === undefined) return undefined
    try {
      return this.parseQuery<T>(obj)
    } catch {
      return undefined
    }
  }

  async getPayloadsWithoutQuery(): Promise<PayloadWrapper<Payload>[]> {
    this._payloadsWithoutQuery
      = this._payloadsWithoutQuery
        ?? (await Promise.all(
          (await PayloadBuilder.filterExclude(this.payloads, this.payload.query)).map(payload => PayloadWrapper.wrap(payload)).filter(exists),
        ))
    return this._payloadsWithoutQuery
  }

  async getQuery(): Promise<T> {
    const payloadMap = await this.payloadsDataHashMap()
    this._query = this._query ?? (payloadMap[this.boundwitness.query] as T | undefined)
    return assertEx(this._query, () => `Missing Query [${JSON.stringify(this.boundwitness)}]`)
  }
}
