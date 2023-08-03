import { assertEx } from '@xylabs/assert'
import {
  CryptoWalletNftWitnessConfig,
  isNftWitnessQueryPayload,
  NftInfoPayload,
  NftSchema,
  NftWitnessConfigSchema,
} from '@xyo-network/crypto-nft-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { getNftsOwnedByAddress } from './lib'

export type CryptoWalletNftWitnessParams = WitnessParams<AnyConfigSchema<CryptoWalletNftWitnessConfig>>

const schema = NftSchema

const defaultMaxNfts = 100

export class CryptoWalletNftWitness<TParams extends CryptoWalletNftWitnessParams = CryptoWalletNftWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [NftWitnessConfigSchema]

  protected override async observeHandler(payloads?: Payload[]): Promise<Payload[]> {
    await this.started('throw')
    const queries = payloads?.filter(isNftWitnessQueryPayload) ?? []
    const observations = await Promise.all(
      queries.map(async (query) => {
        const address = assertEx(query?.address || this.config.address, 'params.address is required')
        const chainId = assertEx(query?.chainId || this.config.chainId, 'params.chainId is required')
        const maxNfts = query?.maxNfts || defaultMaxNfts
        const nfts = await getNftsOwnedByAddress(address, chainId, this.account.private.hex, maxNfts)
        const observation = nfts.map<NftInfoPayload>((nft) => {
          return { ...nft, schema }
        })
        return observation
      }),
    )
    return observations.flat()
  }
}
