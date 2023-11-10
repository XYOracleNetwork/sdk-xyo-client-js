import { InfuraProvider, Provider, WebSocketProvider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { EthAddress } from '@xylabs/eth-address'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { PayloadHasher } from '@xyo-network/core'
import {
  isNftCollectionWitnessQuery,
  NftCollectionInfo,
  NftCollectionSchema,
  NftCollectionWitnessConfig,
  NftCollectionWitnessConfigSchema,
  NftCollectionWitnessQuery,
} from '@xyo-network/crypto-nft-collection-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { ERC721Enumerable__factory } from '@xyo-network/open-zeppelin-typechain'
import { getProviderFromEnv } from '@xyo-network/witness-blockchain-abstract'
import { WitnessParams } from '@xyo-network/witness-model'

import { getNftCollectionMetrics, getNftCollectionNfts, tokenTypes } from './lib'

export type CryptoNftCollectionWitnessParams = WitnessParams<
  AnyConfigSchema<NftCollectionWitnessConfig>,
  {
    provider: Provider
  }
>

const defaultMaxNfts = 100

/**
 * A "no operation" Promise to be used
 * when no action is desired but a Promise
 * is required to be returned
 */
const NoOp = Promise.resolve()

function resolvedValue<T>(settled: PromiseSettledResult<T>, assert: true): T
function resolvedValue<T>(settled: PromiseSettledResult<T>, assert?: false): T | undefined
function resolvedValue<T>(settled: PromiseSettledResult<T>, assert?: boolean) {
  if (assert && settled.status === 'rejected') {
    throw settled.reason
  }
  return settled.status === 'fulfilled' ? settled.value : undefined
}

export class CryptoNftCollectionWitness<TParams extends CryptoNftCollectionWitnessParams = CryptoNftCollectionWitnessParams> extends AbstractWitness<
  TParams,
  NftCollectionWitnessQuery,
  NftCollectionInfo
> {
  static override configSchemas = [NftCollectionWitnessConfigSchema]

  protected providers: Record<number, WebSocketProvider | InfuraProvider> = {}

  protected getProvider(chainId: number) {
    this.providers[chainId] = this.providers[chainId] ?? getProviderFromEnv(chainId)
    return this.providers[chainId]
  }

  protected override async observeHandler(payloads?: NftCollectionWitnessQuery[]): Promise<NftCollectionInfo[]> {
    await this.started('throw')
    const queries = payloads?.filter(isNftCollectionWitnessQuery) ?? []
    const observations = await Promise.all(
      queries.map<Promise<NftCollectionInfo>>(async (query) => {
        const chainId = assertEx(query?.chainId || this.config.chainId, 'params.chainId is required')
        const provider = this.getProvider(chainId)
        const address = assertEx(
          EthAddress.parse(assertEx(query?.address || this.config.address, 'params.address is required')),
          'Failed to parse params.address',
        ).toString()

        const erc721Enumerable = ERC721Enumerable__factory.connect(address, provider)

        const maxNfts = query?.maxNfts || defaultMaxNfts
        const [name, symbol, total, typesSettled, archivistSettled] = await Promise.allSettled([
          await erc721Enumerable.name(),
          await erc721Enumerable.symbol(),
          (await erc721Enumerable.totalSupply()).toNumber(),
          await tokenTypes(provider, address),
          await this.writeArchivist(),
        ])
        const types = resolvedValue(typesSettled, true)
        const nfts = await getNftCollectionNfts(address, provider, types, maxNfts)
        const metrics = getNftCollectionMetrics(nfts)
        const archivist = resolvedValue(archivistSettled)
        const [sources] = await Promise.all([
          // Hash all the payloads
          Promise.all(nfts.map((nft) => PayloadHasher.hashAsync(nft))),
          // Insert them into the archivist if we have one
          archivist ? archivist.insert(nfts) : NoOp,
        ])
        const payload: NftCollectionInfo = {
          address,
          chainId,
          metrics,
          name: resolvedValue(name, true),
          schema: NftCollectionSchema,
          sources,
          symbol: resolvedValue(symbol, true),
          total: resolvedValue(total, true),
          type: types.at(0),
          types,
        }
        return payload
      }),
    )
    return observations.flat()
  }
}
