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
      const observations = await Promise.allSettled(
        inPayloads.filter(isPayloadOfSchemaType(CryptoContractFunctionCallSchema)).map(async (callPayload) => {
          const fullCallPayload = { ...{ params: [] }, ...this.config.call, ...callPayload }
          const { address, functionName, params } = fullCallPayload
          const validatedAddress = assertEx(address, 'Missing address')
          const validatedFunctionName = assertEx(functionName, 'Missing functionName')
          const contract = this.params.factory(validatedAddress)
          const func = assertEx(contract.callStatic[validatedFunctionName], `functionName [${validatedFunctionName}] not found`)
          const rawResult = await (async () => {
            if (params.length > 0) {
              return await func(...(params ?? []))
              /*const x = ERC721Enumerable__factory.connect(validatedAddress, contract.provider)
              return await x.tokenByIndex(0)*/
            } else {
              return await func(...(params ?? []))
            }
          })()
          const result: CryptoContractFunctionCallResult['result'] = BigNumber.isBigNumber(rawResult)
            ? { type: 'BigNumber', value: rawResult.toHexString() }
            : { value: rawResult }
          const observation: CryptoContractFunctionCallResult = {
            address: validatedAddress,
            chainId: (await contract.provider.getNetwork()).chainId,
            functionName: validatedFunctionName,
            params,
            result,
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
