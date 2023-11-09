import { JsonRpcProvider, Provider, WebSocketProvider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { EthAddress } from '@xylabs/eth-address'
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

export type CryptoWalletNftWitnessParams = WitnessParams<
  AnyConfigSchema<CryptoWalletNftWitnessConfig>,
  {
    provider: JsonRpcProvider | WebSocketProvider
  }
>

const schema = NftSchema

const defaultMaxNfts = 100

export class CryptoWalletNftWitness<TParams extends CryptoWalletNftWitnessParams = CryptoWalletNftWitnessParams> extends AbstractWitness<
  TParams,
  NftWitnessQuery,
  NftInfo
> {
  static override configSchemas = [NftWitnessConfigSchema]

  get provider() {
    return this.params.provider
  }

  get timeout() {
    return this.config.timeout ?? 10000
  }

  protected override async observeHandler(payloads?: NftWitnessQuery[]): Promise<NftInfo[]> {
    await this.started('throw')
    const queries = payloads?.filter(isNftWitnessQuery) ?? []
    try {
      const observations = await Promise.all(
        queries.map(async (query) => {
          const addressValue = assertEx(query?.address ?? this.config.address, 'params.address is required')
          const parsedAddressValue = EthAddress.parse(addressValue)
          const address = assertEx(parsedAddressValue?.toString(), 'Failed to parse params.address')
          const network = this.provider.network
          const chainId = assertEx(network.chainId, 'params.chainId is required')
          const maxNfts = query?.maxNfts || defaultMaxNfts
          try {
            const nfts = await getNftsOwnedByAddress(address, this.provider, maxNfts, this.timeout)
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
