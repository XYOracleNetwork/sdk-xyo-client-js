import { BigNumber } from '@ethersproject/bignumber'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { BaseProvider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { AbstractBlockchainWitness, BlockchainWitnessConfig, BlockchainWitnessParams } from '@xyo-network/witness-blockchain-abstract'

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

const ERC1967_PROXY_IMPLEMENTATION_STORAGE_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
const ERC1967_PROXY_BEACON_STORAGE_SLOT = '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50'

const readAddressFromSlot = async (provider: BaseProvider, address: string, slot: string, returnAddressAsDefault = false) => {
  const slotAddress = `0x${(await provider.getStorageAt(address, slot)).substring(26)}`

  if (!returnAddressAsDefault) {
    return slotAddress
  } else {
    return slotAddress === '0x000000000000000000000000000000000000000000' ? address : slotAddress
  }
}

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
          const implementation = await readAddressFromSlot(provider, validatedAddress, ERC1967_PROXY_IMPLEMENTATION_STORAGE_SLOT, true)

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
