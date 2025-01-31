import { assertEx } from '@xylabs/assert'
import type { QueryBoundWitnessFields } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload'
import type { Query } from '@xyo-network/payload-model'

import { BoundWitnessBuilder } from '../Builder.ts'

export class QueryBoundWitnessBuilder<
  TFields extends QueryBoundWitnessFields = QueryBoundWitnessFields,
  TQuery extends Query = Query,
> extends BoundWitnessBuilder<TFields> {
  private _query: TQuery | undefined

  override async dataHashableFields() {
    const fields = {
      ...(await super.dataHashableFields()),
      query: await PayloadBuilder.dataHash(assertEx(this._query, () => 'No Query Specified')),
    }
    return fields
  }

  query<T extends TQuery>(query: T) {
    this.payload(query)
    this._query = query
    return this
  }
}
