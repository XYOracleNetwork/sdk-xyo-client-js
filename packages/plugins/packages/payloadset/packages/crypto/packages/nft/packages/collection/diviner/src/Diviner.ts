import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { PayloadHasher } from '@xyo-network/core'
import {
  isNftCollectionInfoPayload,
  NftCollectionScoreDivinerConfig,
  NftCollectionScoreDivinerConfigSchema,
  NftCollectionScorePayload,
  NftCollectionScoreSchema,
} from '@xyo-network/crypto-nft-collection-payload-plugin'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

import { analyzeNftCollection, NftCollectionAnalysis } from './lib'

export type NftCollectionScoreDivinerParams = DivinerParams<AnyConfigSchema<NftCollectionScoreDivinerConfig>>

const toNftCollectionScorePayload = (rating: NftCollectionAnalysis): NftCollectionScorePayload => {
  return { ...rating, schema: NftCollectionScoreSchema } as unknown as NftCollectionScorePayload
}

export const isNftCollectionScorePayload = (payload: Payload): payload is NftCollectionScorePayload => payload.schema === NftCollectionScoreSchema

export class NftCollectionScoreDiviner<
  TParams extends NftCollectionScoreDivinerParams = NftCollectionScoreDivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchemas = [NftCollectionScoreDivinerConfigSchema]

  protected override divineHandler = async (payloads?: Payload[]): Promise<Payload[]> => {
    const nfts = payloads?.filter(isNftCollectionInfoPayload) ?? []
    const results = await Promise.all(
      nfts.map<Promise<NftCollectionScorePayload>>(async (p) => {
        const [score, sourceHash] = await Promise.all([
          // Get score
          toNftCollectionScorePayload(await analyzeNftCollection(p)),
          // Hash sources
          PayloadHasher.hashAsync(p),
        ])
        return { ...score, schema: NftCollectionScoreSchema, sources: [sourceHash] } as NftCollectionScorePayload
      }),
    )
    return results
  }
}
