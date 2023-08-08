import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { PayloadHasher } from '@xyo-network/core'
import {
  isNftInfo,
  NftInfo,
  NftScore,
  NftScoreDivinerConfig,
  NftScoreDivinerConfigSchema,
  NftScoreSchema,
} from '@xyo-network/crypto-nft-payload-plugin'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

import { analyzeNft, NftAnalysis } from './lib'

export type NftScoreDivinerParams = DivinerParams<AnyConfigSchema<NftScoreDivinerConfig>>

const toNftScorePayload = (nftInfo: NftInfo, scores: NftAnalysis): NftScore => {
  const { chainId, contract, type } = nftInfo
  return { chainId, contract, schema: NftScoreSchema, scores, type }
}

export const isNftScore = (payload: Payload): payload is NftScore => payload.schema === NftScoreSchema

export class NftScoreDiviner<TParams extends NftScoreDivinerParams = NftScoreDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [NftScoreDivinerConfigSchema]

  protected override divineHandler = async (payloads?: Payload[]): Promise<Payload[]> => {
    const nftInfos = payloads?.filter(isNftInfo) ?? []
    const results = await Promise.all(
      nftInfos.map<Promise<NftScore>>(async (nftInfo) => {
        const [score, sourceHash] = await Promise.all([
          // Analyze the NFT
          toNftScorePayload(nftInfo, await analyzeNft(nftInfo)),
          // Hash the source payload
          PayloadHasher.hashAsync(nftInfo),
        ])
        return { ...score, sources: [sourceHash] }
      }),
    )
    return results
  }
}
