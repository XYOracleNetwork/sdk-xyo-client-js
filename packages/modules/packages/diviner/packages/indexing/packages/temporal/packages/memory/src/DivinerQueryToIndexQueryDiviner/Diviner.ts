import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { isPayloadDivinerQueryPayload, PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { Labels } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema } from './Config'

/**
 * A diviner that converts diviner query to index query
 */
export class TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner extends AbstractDiviner {
  static override readonly configSchema = TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema
  static override configSchemas = [DivinerConfigSchema, TemporalIndexingDivinerDivinerQueryToIndexQueryDivinerConfigSchema]
  static labels: Labels = {
    'network.xyo.diviner.stage': 'divinerQueryToIndexQueryDiviner',
  }
  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    const queries = payloads.filter(isPayloadDivinerQueryPayload)
    if (queries.length) {
      const results = await Promise.all(
        queries.map((query) => {
          const { limit: payloadLimit, offset: payloadOffset, order: payloadOrder } = query
          const limit = payloadLimit ?? 1
          const order = payloadOrder ?? 'desc'
          const offset = payloadOffset ?? 0
          // TODO: Add support for additional filters
          const fields: Partial<PayloadDivinerQueryPayload> = { limit, offset, order }
          return new PayloadBuilder({ schema: PayloadDivinerQuerySchema }).fields(fields).build()
        }),
      )
      return results
    }
    return Promise.resolve([])
  }
}
