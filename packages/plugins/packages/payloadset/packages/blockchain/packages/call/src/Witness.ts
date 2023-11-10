import { BigNumber } from '@ethersproject/bignumber'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { assertEx } from '@xylabs/assert'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { AbstractBlockchainWitness, BlockchainWitnessConfig, BlockchainWitnessParams } from '@xyo-network/witness-blockchain-abstract'

import { BlockchainCall, BlockchainCallResult, BlockchainCallResultSchema, BlockchainCallSchema, BlockchainCallSuccess } from './Payload'

export const BlockchainCallWitnessConfigSchema = 'network.xyo.blockchain.call.witness.config'
export type BlockchainCallWitnessConfigSchema = typeof BlockchainCallWitnessConfigSchema

export type BlockchainCallWitnessConfig = BlockchainWitnessConfig<
  {
    address?: string
    args?: unknown[]
    contract?: ContractInterface
    functionName?: string
  },
  BlockchainCallWitnessConfigSchema
>

export type BlockchainCallWitnessParams = BlockchainWitnessParams<BlockchainCallWitnessConfig>

export class BlockchainCallWitness<TParams extends BlockchainCallWitnessParams = BlockchainCallWitnessParams> extends AbstractBlockchainWitness<
  TParams,
  BlockchainCall,
  BlockchainCallResult
> {
  static override configSchemas = [BlockchainCallWitnessConfigSchema]

  get contract() {
    return assertEx(this.config.contract, 'Missing contract')
  }

  protected override async observeHandler(inPayloads: BlockchainCall[] = []): Promise<BlockchainCallResult[]> {
    await this.started('throw')
    try {
      const observations = await Promise.all(
        inPayloads.filter(isPayloadOfSchemaType(BlockchainCallSchema)).map(async ({ functionName, args, address }) => {
          const validatedAddress = assertEx(address ?? this.config.address, 'Missing address')
          const validatedFunctionName = assertEx(functionName ?? this.config.functionName, 'Missing address')
          const mergedArgs = [...(args ?? this.config.args ?? [])]

          const provider = this.provider
          const contract = new Contract(validatedAddress, this.contract, provider)
          let transformedResult: unknown
          try {
            const result = await contract.callStatic[validatedFunctionName](...mergedArgs)
            transformedResult = BigNumber.isBigNumber(result) ? result.toHexString() : result
          } catch (ex) {
            const error = ex as Error & { code: string }
            this.logger.error(`Error [${this.config.name}]: ${error.code}`)
          }
          const observation: BlockchainCallSuccess = {
            address: validatedAddress,
            args: mergedArgs,
            chainId: provider.network.chainId,
            functionName: validatedFunctionName,
            result: transformedResult,
            schema: BlockchainCallResultSchema,
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
