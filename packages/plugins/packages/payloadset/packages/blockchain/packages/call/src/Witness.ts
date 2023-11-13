import { BigNumber } from '@ethersproject/bignumber'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { BaseProvider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import {
  AbstractBlockchainWitness,
  BlockchainWitnessConfig,
  BlockchainWitnessParams,
  ERC1967_PROXY_IMPLEMENTATION_STORAGE_SLOT,
  readAddressFromSlot,
} from '@xyo-network/witness-blockchain-abstract'

import {
  BlockchainContractCall,
  BlockchainContractCallResult,
  BlockchainContractCallResultSchema,
  BlockchainContractCallSchema,
  BlockchainContractCallSuccess,
} from './Payload'

export const BlockchainContractCallWitnessConfigSchema = 'network.xyo.blockchain.contract.call.witness.config'
export type BlockchainContractCallWitnessConfigSchema = typeof BlockchainContractCallWitnessConfigSchema

export type BlockchainContractCallWitnessConfig = BlockchainWitnessConfig<
  {
    address?: string
    args?: unknown[]
    contract?: ContractInterface
    functionName?: string
  },
  BlockchainContractCallWitnessConfigSchema
>

export type BlockchainContractCallWitnessParams = BlockchainWitnessParams<BlockchainContractCallWitnessConfig>

export class BlockchainContractCallWitness<
  TParams extends BlockchainContractCallWitnessParams = BlockchainContractCallWitnessParams,
> extends AbstractBlockchainWitness<TParams, BlockchainContractCall, BlockchainContractCallResult> {
  static override configSchemas = [BlockchainContractCallWitnessConfigSchema]

  get contract() {
    return assertEx(this.config.contract, 'Missing contract')
  }

  protected override async observeHandler(inPayloads: BlockchainContractCall[] = []): Promise<BlockchainContractCallResult[]> {
    await this.started('throw')
    try {
      const observations = await Promise.all(
        inPayloads.filter(isPayloadOfSchemaType(BlockchainContractCallSchema)).map(async ({ functionName, args, address }) => {
          const validatedAddress = assertEx(address ?? this.config.address, 'Missing address')
          const validatedFunctionName = assertEx(functionName ?? this.config.functionName, 'Missing address')
          const mergedArgs = [...(args ?? this.config.args ?? [])]

          const provider = this.provider

          //Check if ERC-1967 Upgradeable
          const implementation = await readAddressFromSlot(provider, validatedAddress, ERC1967_PROXY_IMPLEMENTATION_STORAGE_SLOT)

          const contract = new Contract(implementation, this.contract, provider)
          let transformedResult: unknown
          try {
            const result = await contract.callStatic[validatedFunctionName](...mergedArgs)
            transformedResult = BigNumber.isBigNumber(result) ? result.toHexString() : result
          } catch (ex) {
            const error = ex as Error & { code: string }
            this.logger.error(`Error [${this.config.name}]: ${error.code}`)
          }
          const observation: BlockchainContractCallSuccess = {
            address: validatedAddress,
            args: mergedArgs,
            chainId: provider.network.chainId,
            functionName: validatedFunctionName,
            result: transformedResult,
            schema: BlockchainContractCallResultSchema,
          }
          if (implementation !== validatedAddress) {
            observation.implementation = implementation
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
