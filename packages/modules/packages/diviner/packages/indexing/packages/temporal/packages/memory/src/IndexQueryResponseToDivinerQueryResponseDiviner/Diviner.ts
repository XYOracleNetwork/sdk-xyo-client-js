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
    // NOTE: We're not doing anything with the query payloads but some diviners
    // might want to use this to transform from the query to the response (for example
    // if we use a plaintext value in the query to generate a hash key in the index)
    // const queries = payloads.filter(isPayloadDivinerQueryPayload)
    const responses = payloads.filter((p) => !isPayloadDivinerQueryPayload(p))
    return await Promise.resolve(responses)
  }
}
