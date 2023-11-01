import { assertEx } from '@xylabs/assert'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import {
  CryptoContractFunctionCall,
  CryptoContractFunctionCallResult,
  CryptoContractFunctionCallResultSchema,
  CryptoContractFunctionCallSchema,
  CryptoContractFunctionReadWitnessConfig,
  CryptoContractFunctionReadWitnessConfigSchema,
} from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { PayloadHasher } from '@xyo-network/hash'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { WitnessParams } from '@xyo-network/witness-model'
import { BigNumber, Contract } from 'ethers'

export type CryptoContractFunctionReadWitnessParams<TContract extends Contract> = WitnessParams<
  AnyConfigSchema<CryptoContractFunctionReadWitnessConfig>,
  {
    factory: (address: string) => TContract
  }
>

export class CryptoContractFunctionReadWitness<
  TContract extends Contract = Contract,
  TParams extends CryptoContractFunctionReadWitnessParams<TContract> = CryptoContractFunctionReadWitnessParams<TContract>,
> extends AbstractWitness<TParams, CryptoContractFunctionCall<keyof TContract['callStatic']>, CryptoContractFunctionCallResult> {
  static override configSchemas = [CryptoContractFunctionReadWitnessConfigSchema]

  protected override async observeHandler(
    inPayloads: CryptoContractFunctionCall<keyof TContract['callStatic']>[] = [],
  ): Promise<CryptoContractFunctionCallResult[]> {
    await this.started('throw')
    try {
      const observations = await Promise.all(
        inPayloads.filter(isPayloadOfSchemaType(CryptoContractFunctionCallSchema)).map(async (callPayload) => {
          const fullCallPayload = { ...{ params: [] }, ...this.config.call, ...callPayload }
          const { address, functionName, params } = fullCallPayload
          const validatedAddress = assertEx(address, 'Missing address')
          const contract = this.params.factory(validatedAddress)
          const func = assertEx(contract.callStatic[assertEx(functionName, 'missing functionName')], `functionName [${functionName}] not found`)
          const rawResult = await func(...(params ?? []))
          const result: CryptoContractFunctionCallResult['result'] = BigNumber.isBigNumber(rawResult)
            ? { type: 'BigNumber', value: rawResult.toHexString() }
            : { value: rawResult }
          const observation: CryptoContractFunctionCallResult = {
            address: validatedAddress,
            call: await PayloadHasher.hashAsync(fullCallPayload),
            chainId: (await contract.provider.getNetwork()).chainId,
            result,
            schema: CryptoContractFunctionCallResultSchema,
          }
          return observation
        }),
      )
      return observations.flat()
    } catch (ex) {
      const error = ex as Error
      console.log(`Error [${this.config.name}]: ${error.message}`)
    }

    return []
  }
}
