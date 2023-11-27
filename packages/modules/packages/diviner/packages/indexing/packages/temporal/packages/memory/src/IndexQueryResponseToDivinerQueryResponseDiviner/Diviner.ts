import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { isPayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { Labels } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { IndexQueryResponseToDivinerQueryResponseDivinerConfigSchema } from './Config'

/**
 * Transforms an ImageThumbnailIndex response into an ImageThumbnailResponse response
 */
export class TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner extends AbstractDiviner {
  static override readonly configSchema = IndexQueryResponseToDivinerQueryResponseDivinerConfigSchema
  static override configSchemas = [DivinerConfigSchema, IndexQueryResponseToDivinerQueryResponseDivinerConfigSchema]
  static labels: Labels = {
    'network.xyo.diviner.stage': 'indexQueryResponseToDivinerQueryResponseDiviner',
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    await Promise.resolve()
    const imageThumbnailDivinerQueries = payloads.filter(isPayloadDivinerQueryPayload)
    return imageThumbnailDivinerQueries
  }
}
