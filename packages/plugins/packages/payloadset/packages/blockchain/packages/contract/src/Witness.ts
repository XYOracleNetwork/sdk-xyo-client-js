import { assertEx } from '@xylabs/assert'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import {
  AbstractBlockchainWitness,
  BlockchainAddress,
  BlockchainAddressSchema,
  BlockchainWitnessConfig,
  BlockchainWitnessParams,
} from '@xyo-network/witness-blockchain-abstract'

import { BlockchainContract, BlockchainContractSchema } from './Payload'

export const BlockchainContractWitnessConfigSchema = 'network.xyo.blockchain.contract.witness.config'
export type BlockchainContractWitnessConfigSchema = typeof BlockchainContractWitnessConfigSchema

export type BlockchainContractWitnessConfig = BlockchainWitnessConfig<{ address?: string }, BlockchainContractWitnessConfigSchema>

export type BlockchainContractWitnessParams = BlockchainWitnessParams<BlockchainContractWitnessConfig>

export class BlockchainContractWitness<
  TParams extends BlockchainContractWitnessParams = BlockchainContractWitnessParams,
> extends AbstractBlockchainWitness<TParams, BlockchainAddress, BlockchainContract> {
  static override configSchemas = [BlockchainContractWitnessConfigSchema]

  protected override async observeHandler(inPayloads: BlockchainAddress[] = []): Promise<BlockchainContract[]> {
    await this.started('throw')
    try {
      const observations = await Promise.all(
        inPayloads.filter(isPayloadOfSchemaType(BlockchainAddressSchema)).map(async ({ address }) => {
          const validatedAddress = assertEx(address ?? this.config.address, 'Missing address')

          const provider = await this.getProvider(true, true)

          const block = await provider.getBlockNumber()
          const code = await provider.getCode(validatedAddress, block)

          const observation: BlockchainContract = {
            address: validatedAddress,
            block,
            chainId: provider.network.chainId,
            code,
            schema: BlockchainContractSchema,
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
