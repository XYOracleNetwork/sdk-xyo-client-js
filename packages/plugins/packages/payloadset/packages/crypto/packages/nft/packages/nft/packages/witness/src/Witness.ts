import { assertEx } from '@xylabs/assert'
import { EthAddress } from '@xylabs/eth-address'
import {
  CryptoWalletNftWitnessConfig,
  isNftWitnessQuery,
  NftInfo,
  NftSchema,
  NftWitnessConfigSchema,
  NftWitnessQuery,
} from '@xyo-network/crypto-nft-payload-plugin'
import { AbstractBlockchainWitness, BlockchainWitnessParams } from '@xyo-network/witness-blockchain-abstract'

import { getNftsOwnedByAddress, getNftsOwnedByAddressWithMetadata } from './lib'

export type CryptoWalletNftWitnessParams = BlockchainWitnessParams<CryptoWalletNftWitnessConfig>

const schema = NftSchema

const defaultMaxNfts = 200

export class CryptoWalletNftWitness<TParams extends CryptoWalletNftWitnessParams = CryptoWalletNftWitnessParams> extends AbstractBlockchainWitness<
  TParams,
  NftWitnessQuery,
  NftInfo
> {
  static override configSchemas = [NftWitnessConfigSchema]

  get loadMetadata() {
    return this.config.loadMetadata ?? true
  }

  get timeout() {
    return this.config.timeout ?? 10000
  }

  protected override async observeHandler(payloads?: NftWitnessQuery[]): Promise<NftInfo[]> {
    await this.started('throw')
    const queries = payloads?.filter(isNftWitnessQuery) ?? []
    //calling it here to make sure we rests the cache
    const providers = await this.getProviders()
    try {
      const observations = await Promise.all(
        queries.map(async (query) => {
          const provider = await this.getProvider(true, true)
          const addressValue = assertEx(query?.address ?? this.config.address, 'params.address is required')
          const parsedAddressValue = EthAddress.parse(addressValue)
          const address = assertEx(parsedAddressValue?.toString(), 'Failed to parse params.address')
          const network = provider.network
          const chainId = assertEx(network.chainId, 'params.chainId is required')
          const maxNfts = query?.maxNfts || defaultMaxNfts
          try {
            const nfts = this.loadMetadata
              ? await getNftsOwnedByAddressWithMetadata(address, providers, maxNfts, this.timeout)
              : await getNftsOwnedByAddress(address, providers, maxNfts, this.timeout)
            const observation = nfts.map<NftInfo>((nft) => {
              return { ...nft, schema }
            })
            return observation
          } catch (ex) {
            const error = ex as Error
            throw Error(`Failed to get nfts for address ${address} on chainId ${chainId}: ${error.message}`)
          }
        }),
      )
      return observations.flat()
    } catch (ex) {
      const error = ex as Error
      console.error(error)
      return []
    }
  }
}
