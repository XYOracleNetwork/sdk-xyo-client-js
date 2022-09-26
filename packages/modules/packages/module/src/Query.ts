import { assertEx } from '@xylabs/assert'
import { BoundWitnessBuilder, BoundWitnessWrapper, XyoBoundWitness } from '@xyo-network/boundwitness'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'

export interface XyoQueryFields {
  /** @field The maximum XYO that can be spent executing the query */
  budget?: number

  /** @field The frequency on which this query can be rerun */
  maxFrequency?: 'once' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

  /** @field The starting point for the bidding on the query */
  minBid?: number

  /** @field The addresses of the intended handlers */
  address?: string | [string]
}

export type XyoQuery<T extends XyoPayload | void = void> = T extends XyoPayload ? XyoPayload<T & XyoQueryFields> : XyoPayload<XyoQueryFields>

export type XyoQueryBoundWitnessSchema = 'network.xyo.boundwitness.query'

export type XyoQueryBoundWitness = XyoBoundWitness<{ schema: XyoQueryBoundWitnessSchema; query: string }>

export class QueryBoundWitnessWrapper<T extends XyoQuery = XyoQuery> extends BoundWitnessWrapper<XyoQueryBoundWitness> {
  private isQueryBoundWitnessWrapper = true

  private _query: PayloadWrapper<T> | undefined

  public get query() {
    return assertEx(
      (this._query = this._query ?? this.payloads[this.obj.query] ? PayloadWrapper.parse<T>(this.payloads[this.obj.query]) : undefined),
      `Missing Query [${this.obj.query}, ${JSON.stringify(this.payloads, null, 2)}]`,
    )
  }

  public static parseQuery<T extends XyoQuery = XyoQuery>(obj: unknown, payloads?: XyoPayloads): QueryBoundWitnessWrapper<T> {
    assertEx(!Array.isArray(obj), 'Array can not be converted to QueryBoundWitnessWrapper')
    switch (typeof obj) {
      case 'object': {
        const castWrapper = obj as QueryBoundWitnessWrapper<T>
        return castWrapper?.isQueryBoundWitnessWrapper ? castWrapper : new QueryBoundWitnessWrapper<T>(obj as XyoQueryBoundWitness, payloads)
      }
    }
    throw Error(`Unable to parse [${typeof obj}]`)
  }
}

export class QueryBoundWitnessBuilder<T extends XyoQueryBoundWitness = XyoQueryBoundWitness> extends BoundWitnessBuilder<T> {
  private _query: string | undefined
  public query(hash?: string) {
    this._query = hash
    return this
  }

  public override hashableFields(): T {
    return { ...super.hashableFields(), query: this._query }
  }
}
