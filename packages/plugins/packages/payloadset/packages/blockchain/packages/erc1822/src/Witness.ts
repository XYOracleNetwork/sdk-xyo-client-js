import { assertEx } from '@xylabs/assert'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import {
  AbstractBlockchainWitness,
  BlockchainAddress,
  BlockchainAddressSchema,
  BlockchainWitnessConfig,
  BlockchainWitnessParams,
} from '@xyo-network/witness-blockchain-abstract'

import { getErc1822Status } from './lib'
import { BlockchainErc1822Status, BlockchainErc1822StatusSchema } from './Payload'

export const BlockchainErc1822WitnessConfigSchema = 'network.xyo.blockchain.Erc1822.witness.config'
export type BlockchainErc1822WitnessConfigSchema = typeof BlockchainErc1822WitnessConfigSchema

export type BlockchainErc1822WitnessConfig = BlockchainWitnessConfig<{ address?: string }, BlockchainErc1822WitnessConfigSchema>

export type BlockchainErc1822WitnessParams = BlockchainWitnessParams<BlockchainErc1822WitnessConfig>

export class BlockchainErc1822Witness<
  TParams extends BlockchainErc1822WitnessParams = BlockchainErc1822WitnessParams,
> extends AbstractBlockchainWitness<TParams, BlockchainAddress, BlockchainErc1822Status> {
  static override configSchemas = [BlockchainErc1822WitnessConfigSchema]

  protected override async observeHandler(inPayloads: BlockchainAddress[] = []): Promise<BlockchainErc1822Status[]> {
    await this.started('throw')
    //calling it here to make sure we rests the cache
    await this.getProviders()
    try {
      const observations = await Promise.all(
        inPayloads.filter(isPayloadOfSchemaType(BlockchainAddressSchema)).map(async ({ address }) => {
          const validatedAddress = assertEx(address ?? this.config.address, 'Missing address')

          const provider = await this.getProvider(true, true)

          const block = await provider.getBlockNumber()

          const { implementation, slots } = await getErc1822Status(provider, validatedAddress, block)

          const observation: BlockchainErc1822Status = {
            address: validatedAddress,
            block,
            chainId: provider.network.chainId,
            implementation,
            schema: BlockchainErc1822StatusSchema,
            slots,
          }
          return observation
        }),
      )
      return observations
    } catch (ex) {
      const error = ex as Error
      console.log(`Error [${this.config.name}]: ${error.message}`)
      throw error
    }
  }
}
