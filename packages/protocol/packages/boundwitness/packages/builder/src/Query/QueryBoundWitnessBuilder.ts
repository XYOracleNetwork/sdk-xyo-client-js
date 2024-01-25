import { assertEx } from '@xylabs/assert'
import { QueryBoundWitness, QueryBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload'
import { Query } from '@xyo-network/payload-model'

import { BoundWitnessBuilder } from '../Builder'

export class QueryBoundWitnessBuilder<
  TBoundWitness extends QueryBoundWitness = QueryBoundWitness,
  TQuery extends Query = Query,
> extends BoundWitnessBuilder<TBoundWitness> {
  private _query: TQuery | undefined

  override async hashableFields(): Promise<TBoundWitness> {
    return {
      ...(await super.hashableFields()),
      query: (await PayloadBuilder.build(assertEx(this._query, 'No Query Specified'))).$hash,
      schema: QueryBoundWitnessSchema,
    }
  }

  query<T extends TQuery>(query: T) {
    this._query = query
    this.payload(this._query)
    return this
  }
}
