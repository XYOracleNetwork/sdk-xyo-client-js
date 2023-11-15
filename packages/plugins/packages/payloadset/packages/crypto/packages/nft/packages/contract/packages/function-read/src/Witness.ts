import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { BaseProvider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import {
  CryptoContractFunctionCall,
  CryptoContractFunctionCallFailure,
  CryptoContractFunctionCallResult,
  CryptoContractFunctionCallResultSchema,
  CryptoContractFunctionCallSchema,
  CryptoContractFunctionCallSuccess,
  CryptoContractFunctionReadWitnessConfig,
  CryptoContractFunctionReadWitnessConfigSchema,
} from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { WitnessParams } from '@xyo-network/witness-model'

export type CryptoContractFunctionReadWitnessParams = WitnessParams<
  AnyConfigSchema<CryptoContractFunctionReadWitnessConfig>,
  {
    providers: BaseProvider[]
  }
>

export class CryptoContractFunctionReadWitness<
  TParams extends CryptoContractFunctionReadWitnessParams = CryptoContractFunctionReadWitnessParams,
> extends AbstractWitness<TParams, CryptoContractFunctionCall, CryptoContractFunctionCallResult> {
  static override configSchemas = [CryptoContractFunctionReadWitnessConfigSchema]

  protected override async observeHandler(inPayloads: CryptoContractFunctionCall[] = []): Promise<CryptoContractFunctionCallResult[]> {
    await this.started('throw')
    try {
      const observations = await Promise.all(
        inPayloads.filter(isPayloadOfSchemaType(CryptoContractFunctionCallSchema)).map(async ({ functionName, args, address }) => {
          const { providers } = this.params
          const provider = providers[Date.now() % providers.length] //pick a random provider
          const validatedAddress = assertEx(address ?? this.config.address, 'Missing address')
          const validatedFunctionName = assertEx(functionName ?? this.config.functionName, 'Missing address')
          const mergedArgs = [...(args ?? this.config.args ?? [])]

          const contract = new Contract(validatedAddress, this.config.contract, provider)
          try {
            const result = await contract.callStatic[validatedFunctionName](...mergedArgs)
            const transformedResult = BigNumber.isBigNumber(result) ? result.toHexString() : result
            const observation: CryptoContractFunctionCallSuccess = {
              address: validatedAddress,
              args: mergedArgs,
              chainId: provider.network.chainId,
              functionName: validatedFunctionName,
              result: transformedResult,
              schema: CryptoContractFunctionCallResultSchema,
            }
            return observation
          } catch (ex) {
            const error = ex as Error & { code: string }
            console.log(`Error [${this.config.name}]: ${error.code}`)
            const observation: CryptoContractFunctionCallFailure = {
              address: validatedAddress,
              args: mergedArgs,
              chainId: provider.network.chainId,
              error: error.code,
              functionName: validatedFunctionName,
              schema: CryptoContractFunctionCallResultSchema,
            }
            return observation
          }
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
