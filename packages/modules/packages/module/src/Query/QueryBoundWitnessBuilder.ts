import { assertEx } from '@xylabs/assert'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness'
import { PayloadSetPayload, PayloadWrapper } from '@xyo-network/payload'

import { XyoQuery } from './Payload'
import { XyoQueryBoundWitness } from './XyoQueryBoundWitness'

export class QueryBoundWitnessBuilder<
  TBoundWitness extends XyoQueryBoundWitness = XyoQueryBoundWitness,
  TQuery extends XyoQuery = XyoQuery,
> extends BoundWitnessBuilder<TBoundWitness> {
  private _query: PayloadWrapper<TQuery> | undefined
  private _resultSet: PayloadWrapper<PayloadSetPayload> | undefined

  public override hashableFields(): TBoundWitness {
    return { ...super.hashableFields(), query: assertEx(this._query?.hash, 'No Query Specified') }
  }

  public query<T extends TQuery | PayloadWrapper<TQuery>>(query: T) {
    this._query = PayloadWrapper.parse(query)
    this.payload(this._query.payload)
    return this
  }

  public resultSet<T extends PayloadSetPayload | PayloadWrapper<PayloadSetPayload>>(payloadSet: T) {
    this._resultSet = PayloadWrapper.parse(payloadSet)
    this.payload(this._resultSet.payload)
    return this
  }
}
