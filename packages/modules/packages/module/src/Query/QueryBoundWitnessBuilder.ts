import { assertEx } from '@xylabs/assert'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness'
import { PayloadWrapper } from '@xyo-network/payload'

import { XyoQuery } from './Payload'
import { XyoQueryBoundWitness } from './XyoQueryBoundWitness'

export class QueryBoundWitnessBuilder<
  TBoundWitness extends XyoQueryBoundWitness = XyoQueryBoundWitness,
  TQuery extends XyoQuery = XyoQuery,
> extends BoundWitnessBuilder<TBoundWitness> {
  private _query: PayloadWrapper<TQuery> | undefined
  public query<T extends TQuery | PayloadWrapper<TQuery>>(query: T) {
    this._query = PayloadWrapper.parse(query)
    this.payload(this._query.payload)
    return this
  }

  public override hashableFields(): TBoundWitness {
    return { ...super.hashableFields(), query: assertEx(this._query?.hash, 'No Query Specified') }
  }
}
