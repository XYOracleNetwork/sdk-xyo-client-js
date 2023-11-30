import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import {
  TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema,
  TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerParams,
  TemporalIndexingDivinerResultIndexSchema,
} from '@xyo-network/diviner-temporal-indexing-model'
import { Labels } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

/**
 * A diviner that converts diviner query to index query
 */
export class TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner<
  TParams extends TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerParams = TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerParams,
> extends AbstractDiviner<TParams> {
  static override readonly configSchema = TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema
  static override configSchemas = [DivinerConfigSchema, TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema]
  static labels: Labels = {
    'network.xyo.diviner.stage': 'divinerQueryToIndexQueryDiviner',
  }

  /**
   * The schema of the diviner query payloads
   */
  protected get divinerQuerySchema(): string {
    return this.config.divinerQuerySchema ?? PayloadDivinerQuerySchema
  }

  /**
   * The schema of the index query payloads
   */
  protected get indexQuerySchema(): string {
    return this.config.indexQuerySchema ?? PayloadDivinerQuerySchema
  }

  /**
   * The schema of the index payloads
   */
  protected get indexSchema(): string {
    return this.config.indexSchema ?? TemporalIndexingDivinerResultIndexSchema
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    const queries = payloads.filter(isPayloadOfSchemaType<PayloadDivinerQueryPayload>(this.divinerQuerySchema))
    if (queries.length) {
      const results = await Promise.all(
        queries.map((query) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { limit: payloadLimit, offset: payloadOffset, order: payloadOrder, schema, ...params } = query
          const limit = payloadLimit ?? 1
          const order = payloadOrder ?? 'desc'
          const offset = payloadOffset ?? 0
          // TODO: Make index schema configurable
          const schemas = [this.indexSchema]
          // TODO: Add support for additional filters
          const fields: Partial<PayloadDivinerQueryPayload> = { limit, offset, order, schemas, ...params }
          return new PayloadBuilder({ schema: this.indexQuerySchema }).fields(fields).build()
        }),
      )
      return results
    }
    return Promise.resolve([])
  }
}
