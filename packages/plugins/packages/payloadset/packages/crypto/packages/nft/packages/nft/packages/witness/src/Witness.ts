import { assertEx } from '@xylabs/assert'
import { EthAddress } from '@xylabs/eth-address'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { CryptoWalletNftWitnessConfig, isNftWitnessQuery, NftInfo, NftSchema, NftWitnessConfigSchema } from '@xyo-network/crypto-nft-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { WitnessParams } from '@xyo-network/witness-model'

import { getNftsOwnedByAddress } from './lib'

export type CryptoWalletNftWitnessParams = WitnessParams<AnyConfigSchema<CryptoWalletNftWitnessConfig>>

const schema = NftSchema

const defaultMaxNfts = 100

export class CryptoWalletNftWitness<TParams extends CryptoWalletNftWitnessParams = CryptoWalletNftWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [NftWitnessConfigSchema]

  protected override async observeHandler(payloads?: Payload[]): Promise<Payload[]> {
    await this.started('throw')
    const queries = payloads?.filter(isNftWitnessQuery) ?? []
    const observations = await Promise.all(
      queries.map(async (query) => {
        const address = assertEx(
          EthAddress.parse(assertEx(query?.address || this.config.address, 'params.address is required')),
          'Failed to parse params.address',
        ).toString()
        const chainId = assertEx(query?.chainId || this.config.chainId, 'params.chainId is required')
        const maxNfts = query?.maxNfts || defaultMaxNfts
        const nfts = await getNftsOwnedByAddress(address, chainId, this.account.private.hex, maxNfts)
        const observation = nfts.map<NftInfo>((nft) => {
          return { ...nft, schema }
        })
        return observation
      }),
    )

    return observations.flat()
  }
}
