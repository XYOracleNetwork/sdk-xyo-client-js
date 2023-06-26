import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { isNftInfoPayload, NftSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

import { evaluateNft, Ratings } from './lib'

type NftScoreSchema = `${NftSchema}.score`
const NftScoreSchema: NftScoreSchema = `${NftSchema}.score`

type NftScoreDivinerConfigSchema = `${NftScoreSchema}.diviner.config`
const NftScoreDivinerConfigSchema: NftScoreDivinerConfigSchema = `${NftScoreSchema}.diviner.config`

export type NftScoreDivinerConfig = DivinerConfig<{ schema: NftScoreDivinerConfigSchema }>
export type NftScoreDivinerParams = DivinerParams<AnyConfigSchema<NftScoreDivinerConfig>>

const toNftScore = (rating: Ratings): Payload => {
  return { ...rating, schema: NftScoreSchema }
}

export class NftScoreDiviner<TParams extends NftScoreDivinerParams = NftScoreDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchema = NftScoreDivinerConfigSchema

  override divine = async (payloads?: Payload[]): Promise<Payload[]> =>
    (await Promise.all(payloads?.filter(isNftInfoPayload).map(evaluateNft) ?? [])).map(toNftScore)
}
