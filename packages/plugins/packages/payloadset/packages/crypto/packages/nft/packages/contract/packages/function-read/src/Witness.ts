import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import {
  CryptoContractFunctionCall,
  CryptoContractFunctionCallResult,
  CryptoContractFunctionCallResultSchema,
  CryptoContractFunctionCallSchema,
  CryptoContractFunctionReadWitnessConfig,
  CryptoContractFunctionReadWitnessConfigSchema,
} from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { WitnessParams } from '@xyo-network/witness-model'

export type CryptoContractFunctionReadWitnessParams = WitnessParams<
  AnyConfigSchema<CryptoContractFunctionReadWitnessConfig>,
  {
    providers: JsonRpcProvider[]
  }
>

export class CryptoContractFunctionReadWitness<
  TParams extends CryptoContractFunctionReadWitnessParams = CryptoContractFunctionReadWitnessParams,
> extends AbstractWitness<TParams, CryptoContractFunctionCall, CryptoContractFunctionCallResult> {
  static override configSchemas = [CryptoContractFunctionReadWitnessConfigSchema]

  protected override async observeHandler(inPayloads: CryptoContractFunctionCall[] = []): Promise<CryptoContractFunctionCallResult[]> {
    await this.started('throw')
    try {
      const observations = await Promise.allSettled(
        inPayloads.filter(isPayloadOfSchemaType(CryptoContractFunctionCallSchema)).map(async ({ functionName, args, address }) => {
          const { providers } = this.params
          const provider = providers[Date.now() % providers.length] //pick a random provider
          const validatedAddress = assertEx(address ?? this.config.address, 'Missing address')
          const validatedFunctionName = assertEx(functionName ?? this.config.functionName, 'Missing address')
          const mergedArgs = [...(args ?? this.config.args ?? [])]

          const contract = new Contract(validatedAddress, this.config.contract, provider)
          const result = await contract.callStatic[validatedFunctionName](...mergedArgs)
          const transformedResult = BigNumber.isBigNumber(result) ? result.toHexString() : result
          const observation: CryptoContractFunctionCallResult = {
            address: validatedAddress,
            args: mergedArgs,
            chainId: provider.network.chainId,
            functionName: validatedFunctionName,
            result: transformedResult,
            schema: CryptoContractFunctionCallResultSchema,
          }
          return observation
        }),
      )
      return observations.filter(fulfilled).map((p) => p.value)
    } catch (ex) {
      const error = ex as Error
      console.log(`Error [${this.config.name}]: ${error.message}`)
    }

    return []
  }
}
