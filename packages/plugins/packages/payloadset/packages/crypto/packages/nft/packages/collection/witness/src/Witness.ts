import { assertEx } from '@xylabs/assert'
import { PayloadHasher } from '@xyo-network/core'
import {
  isNftCollectionWitnessQueryPayload,
  NftCollectionWitnessConfig,
  NftCollectionWitnessConfigSchema,
} from '@xyo-network/crypto-nft-collection-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { getNftCollectionInfo, getNftsInCollection } from './lib'

export type CryptoNftCollectionWitnessParams = WitnessParams<AnyConfigSchema<NftCollectionWitnessConfig>>

export class CryptoNftCollectionWitness<
  TParams extends CryptoNftCollectionWitnessParams = CryptoNftCollectionWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchemas = [NftCollectionWitnessConfigSchema]

  protected override async observeHandler(payloads?: Payload[]): Promise<Payload[]> {
    await this.started('throw')
    const queries = payloads?.filter(isNftCollectionWitnessQueryPayload) ?? []
    const observations = await Promise.all(
      queries.map(async (query) => {
        const address = assertEx(query?.address || this.config.address, 'params.address is required')
        const chainId = assertEx(query?.chainId || this.config.chainId, 'params.chainId is required')
        const collectionInfo = await getNftCollectionInfo(address, chainId, this.account.private.hex)
        const nfts = await getNftsInCollection(address, chainId, this.account.private.hex, 10)
        const sources = await Promise.all(nfts.map((nft) => PayloadHasher.hashAsync(nft)))
        return { ...collectionInfo, sources }
      }),
    )
    return observations.flat()
  }
}
