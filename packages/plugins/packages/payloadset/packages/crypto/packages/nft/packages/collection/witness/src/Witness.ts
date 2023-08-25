import { assertEx } from '@xylabs/assert'
import { PayloadHasher } from '@xyo-network/core'
import {
  isNftCollectionWitnessQuery,
  NftCollectionInfo,
  NftCollectionSchema,
  NftCollectionWitnessConfig,
  NftCollectionWitnessConfigSchema,
} from '@xyo-network/crypto-nft-collection-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { getNftCollectionCount, getNftCollectionMetadata, getNftCollectionMetrics, getNftCollectionNfts } from './lib'

export type CryptoNftCollectionWitnessParams = WitnessParams<AnyConfigSchema<NftCollectionWitnessConfig>>

const defaultMaxNfts = 100

export class CryptoNftCollectionWitness<
  TParams extends CryptoNftCollectionWitnessParams = CryptoNftCollectionWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchemas = [NftCollectionWitnessConfigSchema]

  protected override async observeHandler(payloads?: Payload[]): Promise<Payload[]> {
    await this.started('throw')
    const queries = payloads?.filter(isNftCollectionWitnessQuery) ?? []
    const observations = await Promise.all(
      queries.map<Promise<[NftCollectionInfo, Payload[]]>>(async (query) => {
        const address = assertEx(query?.address || this.config.address, 'params.address is required')
        const chainId = assertEx(query?.chainId || this.config.chainId, 'params.chainId is required')
        const maxNfts = query?.maxNfts || defaultMaxNfts
        const [info, total, nfts] = await Promise.all([
          getNftCollectionMetadata(address, chainId, this.account.private.hex),
          getNftCollectionCount(address, chainId, this.account.private.hex),
          getNftCollectionNfts(address, chainId, this.account.private.hex, maxNfts),
          this.writeArchivist(),
        ])
        const metrics = getNftCollectionMetrics(nfts)
        const sources = await Promise.all(nfts.map((nft) => PayloadHasher.hashAsync(nft)))
        const payload: NftCollectionInfo = { ...info, metrics, schema: NftCollectionSchema, sources, total }
        return [payload, nfts]
      }),
    )
    return observations.flat(2)
  }
}
