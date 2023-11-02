import { assertEx } from '@xylabs/assert'
import { EthAddress } from '@xylabs/eth-address'
import { exists } from '@xylabs/exists'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import {
  CryptoWalletNftWitnessConfig,
  isNftWitnessQuery,
  NftInfo,
  NftSchema,
  NftWitnessConfigSchema,
  NftWitnessQuery,
} from '@xyo-network/crypto-nft-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { WitnessParams } from '@xyo-network/witness-model'

import { getNftsOwnedByAddress } from './lib'

export type CryptoWalletNftWitnessParams = WitnessParams<AnyConfigSchema<CryptoWalletNftWitnessConfig>>

const schema = NftSchema

const defaultMaxNfts = 100

export class CryptoWalletNftWitness<TParams extends CryptoWalletNftWitnessParams = CryptoWalletNftWitnessParams> extends AbstractWitness<
  TParams,
  NftWitnessQuery,
  NftInfo
> {
  static override configSchemas = [NftWitnessConfigSchema]

  get timeout() {
    return this.config.timeout ?? 2000
  }

  protected override async observeHandler(payloads?: NftWitnessQuery[]): Promise<NftInfo[]> {
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
        try {
          const nfts = await getNftsOwnedByAddress(address, chainId, this.account.private.hex, maxNfts, this.timeout)
          const observation = nfts.map<NftInfo>((nft) => {
            return { ...nft, schema }
          })
          return observation
        } catch (error) {
          throw new Error(`Failed to get nfts for address ${address} on chainId ${chainId}`)
        }
      }),
    )
    return observations.filter(exists).flat()
  }
}
