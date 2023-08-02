import type { ExternalProvider, JsonRpcFetchFunc } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import {
  isNftCollectionWitnessQueryPayload,
  NftCollectionWitnessConfig,
  NftCollectionWitnessConfigSchema,
} from '@xyo-network/crypto-nft-collection-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { getNftCollectionInfo } from './lib'

export type CryptoNftCollectionWitnessParams = WitnessParams<
  AnyConfigSchema<NftCollectionWitnessConfig>,
  {
    provider?: ExternalProvider | JsonRpcFetchFunc
  }
>

export class CryptoNftCollectionWitness<
  TParams extends CryptoNftCollectionWitnessParams = CryptoNftCollectionWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchemas = [NftCollectionWitnessConfigSchema]

  protected get provider() {
    return assertEx(this.params.provider, 'Provider Required')
  }

  protected override async observeHandler(payloads?: Payload[]): Promise<Payload[]> {
    await this.started('throw')
    const queries = payloads?.filter(isNftCollectionWitnessQueryPayload) ?? []
    const observations = await Promise.all(
      queries.map(async (query) => {
        const address = assertEx(query?.address || this.config.address, 'params.address is required')
        const chainId = assertEx(query?.chainId || this.config.chainId, 'params.chainId is required')
        const observation = await getNftCollectionInfo(address, chainId, this.account.private.hex)
        return observation
      }),
    )
    return observations.flat()
  }
}
