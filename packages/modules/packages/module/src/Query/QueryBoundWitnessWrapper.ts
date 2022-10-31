import { assertEx } from '@xylabs/assert'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness'
import { PayloadWrapper, XyoPayloads } from '@xyo-network/payload'

import { XyoQuery } from './Payload'
import { XyoQueryBoundWitness } from './XyoQueryBoundWitness'

export class QueryBoundWitnessWrapper<T extends XyoQuery = XyoQuery> extends BoundWitnessWrapper<XyoQueryBoundWitness> {
  private _query: PayloadWrapper<T> | undefined

  private isQueryBoundWitnessWrapper = true

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
