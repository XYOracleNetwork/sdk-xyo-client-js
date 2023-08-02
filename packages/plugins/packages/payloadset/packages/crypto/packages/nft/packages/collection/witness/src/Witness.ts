import { assertEx } from '@xylabs/assert'
import { PayloadHasher } from '@xyo-network/core'
import {
  isNftCollectionWitnessQueryPayload,
  NftCollectionInfoPayload,
  NftCollectionSchema,
  NftCollectionWitnessConfig,
  NftCollectionWitnessConfigSchema,
} from '@xyo-network/crypto-nft-collection-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { getNftCollectionInfo, getNftCollectionNfts, getNftCollectionTotalNfts } from './lib'

export type CryptoNftCollectionWitnessParams = WitnessParams<AnyConfigSchema<NftCollectionWitnessConfig>>

export class CryptoNftCollectionWitness<
  TParams extends CryptoNftCollectionWitnessParams = CryptoNftCollectionWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchemas = [NftCollectionWitnessConfigSchema]

  protected override async observeHandler(payloads?: Payload[]): Promise<Payload[]> {
    await this.started('throw')
    const queries = payloads?.filter(isNftCollectionWitnessQueryPayload) ?? []
    const observations = await Promise.all(
      queries.map<Promise<NftCollectionInfoPayload>>(async (query) => {
        const address = assertEx(query?.address || this.config.address, 'params.address is required')
        const chainId = assertEx(query?.chainId || this.config.chainId, 'params.chainId is required')
        const [info, total, nfts, archivist] = await Promise.all([
          getNftCollectionInfo(address, chainId, this.account.private.hex),
          getNftCollectionTotalNfts(address, chainId, this.account.private.hex),
          getNftCollectionNfts(address, chainId, this.account.private.hex, 10),
          this.writeArchivist(),
        ])
        const [sources] = await Promise.all([
          // Hash all the payloads
          Promise.all(nfts.map((nft) => PayloadHasher.hashAsync(nft))),
          // Insert them into the archivist if we have one
          archivist ? archivist.insert(nfts) : Promise.resolve(),
        ])
        return { ...info, schema: NftCollectionSchema, sources, total }
      }),
    )
    return observations.flat()
  }
}
