import { assertEx } from '@xylabs/assert'
import { PayloadSetPayload, Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { BoundWitnessBuilder } from '../Builder'
import { QueryBoundWitness, QueryBoundWitnessSchema } from './QueryBoundWitness'

export class QueryBoundWitnessBuilder<
  TBoundWitness extends QueryBoundWitness = QueryBoundWitness,
  TQuery extends Query = Query,
> extends BoundWitnessBuilder<TBoundWitness> {
  private _query: PayloadWrapper<TQuery> | undefined
  private _resultSet: PayloadWrapper<PayloadSetPayload> | undefined

  override async hashableFields(): Promise<TBoundWitness> {
    return {
      ...(await super.hashableFields()),
      query: assertEx(await this._query?.hashAsync(), 'No Query Specified'),
      schema: QueryBoundWitnessSchema,
    }
  }

  query<T extends TQuery>(query: T) {
    this._query = PayloadWrapper.wrap(query)
    this.payload(this._query.payload())
    return this
  }

  resultSet<T extends PayloadSetPayload>(payloadSet: T) {
    this._resultSet = PayloadWrapper.wrap(payloadSet)
    this.payload(this._resultSet.payload())
    return this
  }
}
