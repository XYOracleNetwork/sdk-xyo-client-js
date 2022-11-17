import 'reflect-metadata'

import { GetSchemaQuery, QueryHandler } from '@xyo-network/node-core-model'
import { XyoSchemaPayload } from '@xyo-network/schema-payload-plugin'
import { XyoSchemaCache } from '@xyo-network/utils'
import { inject, injectable } from 'inversify'

@injectable()
export class GetSchemaQueryHandler implements QueryHandler<GetSchemaQuery, XyoSchemaPayload> {
  constructor(@inject(XyoSchemaCache) protected readonly schemaArchivist: XyoSchemaCache) {}
  async handle(query: GetSchemaQuery) {
    const entry = await this.schemaArchivist.get(query.payload.name)
    return entry?.payload
  }
}
