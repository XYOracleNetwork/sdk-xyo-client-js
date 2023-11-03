import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { CryptoContractFunctionCallResult, CryptoContractFunctionCallResultSchema } from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export type FindCallResult<TResult = string, TPayload = Payload> = [TResult, TPayload] | [undefined, TPayload] | [undefined, undefined]

export const CryptoContractDivinerConfigSchema = 'network.xyo.crypto.contract.diviner.config'
export type CryptoContractDivinerConfigSchema = typeof CryptoContractDivinerConfigSchema

export type CryptoContractDivinerConfig = DivinerConfig<{
  schema: CryptoContractDivinerConfigSchema
}>
export type CryptoContractDivinerParams = DivinerParams<CryptoContractDivinerConfig>

export const ContractInfoSchema = 'network.xyo.crypto.contract.info'
export type ContractInfoSchema = typeof ContractInfoSchema

export type ContractInfo = Payload<
  {
    address: string
    chainId: string
    results?: Record<string, unknown>
  },
  ContractInfoSchema
>

export class CryptoContractDiviner<TParams extends CryptoContractDivinerParams = CryptoContractDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [CryptoContractDivinerConfigSchema]

  protected static findCallResult<TResult = string>(
    address: string,
    functionName: string,
    payloads: CryptoContractFunctionCallResult[],
  ): TResult | undefined {
    const foundPayload = payloads.find((payload) => payload.functionName === functionName && payload.address === address)
    return foundPayload?.result as TResult | undefined
  }

  protected static matchingExistingField<R = string, T extends Payload = Payload>(objs: T[], field: keyof T): R | undefined {
    const expectedValue = objs.at(0)?.[field] as R
    const didNotMatch = objs.reduce((prev, obj) => {
      return prev || obj[field] !== expectedValue
    }, false)
    return didNotMatch ? undefined : expectedValue
  }

  protected contractInfoRequiredFields(callResults: CryptoContractFunctionCallResult[]): ContractInfo {
    return {
      address: assertEx(CryptoContractDiviner.matchingExistingField(callResults, 'address'), 'Mismatched address'),
      chainId: assertEx(CryptoContractDiviner.matchingExistingField(callResults, 'chainId'), 'Mismatched chainId'),
      schema: ContractInfoSchema,
    }
  }

  protected override async divineHandler(inPayloads: CryptoContractFunctionCallResult[] = []): Promise<ContractInfo[]> {
    const callResults = inPayloads.filter(isPayloadOfSchemaType<CryptoContractFunctionCallResult>(CryptoContractFunctionCallResultSchema))
    const addresses = Object.keys(
      callResults.reduce<Record<string, boolean>>((prev, result) => {
        if (result.address) {
          prev[result.address] = true
        }
        return prev
      }, {}),
    )
    const result = await Promise.all(
      addresses.map(async (address) => {
        const foundCallResults = callResults.filter((callResult) => callResult.address === address)
        const info: ContractInfo = {
          ...{ results: await this.reduceResults(foundCallResults) },
          ...this.contractInfoRequiredFields(foundCallResults),
        }
        return info
      }),
    )

    return result
  }

  protected reduceResults(callResults: CryptoContractFunctionCallResult[]): Promisable<ContractInfo['results']> {
    return callResults.reduce<Record<string, unknown>>((prev, callResult) => {
      prev[callResult.functionName] = callResult.result
      return prev
    }, {})
  }
}
