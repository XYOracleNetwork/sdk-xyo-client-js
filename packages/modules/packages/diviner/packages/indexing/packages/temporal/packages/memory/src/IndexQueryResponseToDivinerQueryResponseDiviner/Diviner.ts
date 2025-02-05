import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { isPayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema } from '@xyo-network/diviner-temporal-indexing-model'
import type { Labels } from '@xyo-network/module-model'
import type { Payload, Schema } from '@xyo-network/payload-model'

/**
 * Transforms an ImageThumbnailIndex response into an ImageThumbnailResponse response
 */
export class TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner extends AbstractDiviner {
  static override readonly configSchemas: Schema[] = [
    ...super.configSchemas,
    TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema,
  ]

  static override readonly defaultConfigSchema: Schema = TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDivinerConfigSchema
  static override readonly labels: Labels = {
    ...super.labels,
    'network.xyo.diviner.stage': 'indexQueryResponseToDivinerQueryResponseDiviner',
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    // NOTE: We're not doing anything with the query payloads but some diviners
    // might want to use this to transform from the query to the response (for example
    // if we use a plaintext value in the query to generate a hash key in the index)
    // const queries = payloads.filter(isPayloadDivinerQueryPayload)
    const responses = payloads.filter(p => !isPayloadDivinerQueryPayload(p))
    return await Promise.resolve(responses)
  }
}
