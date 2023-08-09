import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { PayloadHasher } from '@xyo-network/core'
import {
  isNftCollectionInfo,
  NftCollectionInfo,
  NftCollectionMetadata,
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

const toNftCollectionScorePayload = (nftCollectionInfo: NftCollectionInfo, scores: NftCollectionAnalysis): NftCollectionScorePayload => {
  const { name, symbol, address, chainId, type } = nftCollectionInfo
  const metadata: NftCollectionMetadata = { address, chainId, name, symbol, type }
  return { ...metadata, schema: NftCollectionScoreSchema, scores }
}

export const isNftCollectionScorePayload = (payload: Payload): payload is NftCollectionScorePayload => payload.schema === NftCollectionScoreSchema

export class NftCollectionScoreDiviner<
  TParams extends NftCollectionScoreDivinerParams = NftCollectionScoreDivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchemas = [NftCollectionScoreDivinerConfigSchema]

  protected override divineHandler = async (payloads?: Payload[]): Promise<Payload[]> => {
    const nftCollectionInfos = payloads?.filter(isNftCollectionInfo) ?? []
    const results = await Promise.all(
      nftCollectionInfos.map<Promise<NftCollectionScorePayload>>(async (nftCollectionInfo) => {
        const [score, sourceHash] = await Promise.all([
          // Get score
          toNftCollectionScorePayload(nftCollectionInfo, await analyzeNftCollection(nftCollectionInfo)),
          // Hash sources
          PayloadHasher.hashAsync(nftCollectionInfo),
        ])
        return { ...score, schema: NftCollectionScoreSchema, sources: [sourceHash] } as NftCollectionScorePayload
      }),
    )
    return results
  }
}
