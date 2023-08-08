import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { PayloadHasher } from '@xyo-network/core'
import {
  isNftInfo,
  NftScoreDivinerConfig,
  NftScoreDivinerConfigSchema,
  NftScorePayload,
  NftScoreSchema,
} from '@xyo-network/crypto-nft-payload-plugin'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

import { analyzeNft, NftAnalysis } from './lib'

export type NftScoreDivinerParams = DivinerParams<AnyConfigSchema<NftScoreDivinerConfig>>

const toNftScorePayload = (rating: NftAnalysis): NftScorePayload => {
  return { ...rating, schema: NftScoreSchema } as NftScorePayload
}

export const isNftScorePayload = (payload: Payload): payload is NftScorePayload => payload.schema === NftScoreSchema

export class NftScoreDiviner<TParams extends NftScoreDivinerParams = NftScoreDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [NftScoreDivinerConfigSchema]

  protected override divineHandler = async (payloads?: Payload[]): Promise<Payload[]> => {
    const nfts = payloads?.filter(isNftInfo) ?? []
    const results = await Promise.all(
      nfts.map<Promise<NftScorePayload>>(async (p) => {
        const [score, sourceHash] = await Promise.all([toNftScorePayload(await analyzeNft(p)), PayloadHasher.hashAsync(p)])
        return { ...score, sources: [sourceHash] }
      }),
    )
    return results
  }
}
