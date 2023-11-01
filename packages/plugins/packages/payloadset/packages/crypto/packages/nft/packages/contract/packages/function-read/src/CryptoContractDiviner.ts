import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import {
  CryptoContractFunctionCall,
  CryptoContractFunctionCallResult,
  CryptoContractFunctionCallResultSchema,
  CryptoContractFunctionCallSchema,
} from '@xyo-network/crypto-contract-function-read-payload-plugin'
import { DivinerConfig, DivinerParams } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export type FindCallResult<TResult = string, TPayload = Payload> = [TResult, TPayload] | [undefined, TPayload] | [undefined, undefined]

export const CryptoContractDivinerConfigSchema = 'network.xyo.crypto.contract.diviner.config'
export type CryptoContractDivinerConfigSchema = typeof CryptoContractDivinerConfigSchema

export type CryptoContractDivinerConfig = DivinerConfig
export type CryptoContractDivinerParams = DivinerParams<CryptoContractDivinerConfig>

export const ContractInfoSchema = 'network.xyo.crypto.contract.info'
export type ContractInfoSchema = typeof ContractInfoSchema

export type OmittedContractInfo<TFields extends object | Payload | null = null, TSchema extends string | null = null> = Omit<
  ContractInfo<TFields, TSchema extends null ? (TFields extends Payload ? TFields['schema'] : never) : TSchema>,
  'address' | 'chainId'
>

export type ContractInfo<TFields extends object | null = null, TSchema extends string = ContractInfoSchema> = Payload<
  TFields extends null
    ? object
    : TFields & {
        address: string
        chainId: string
      },
  TSchema
>

export abstract class CryptoContractDiviner<
  TContractInfo extends Payload<Omit<ContractInfo, 'schema'>> = ContractInfo,
  TParams extends CryptoContractDivinerParams = CryptoContractDivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchemas = [CryptoContractDivinerConfigSchema]

  protected static async findCallResult<TResult = string>(
    address: string,
    functionName: string,
    params: unknown[],
    payloads: CryptoContractFunctionCallResult[],
  ): Promise<TResult | undefined> {
    const callHash = await this.generateCallHash(address, functionName, params)
    const foundPayload = payloads.find((payload) => payload.call === callHash)
    return foundPayload?.result.value as TResult | undefined
  }

  protected static async generateCallHash(address: string, functionName: string, params: unknown[]) {
    const callPayload: CryptoContractFunctionCall = {
      address,
      functionName,
      params,
      schema: CryptoContractFunctionCallSchema,
    }
    return await PayloadHasher.hashAsync(callPayload)
  }

  protected static matchingExistingField<R = string, T extends Payload = Payload>(objs: T[], field: keyof T) {
    const expectedValue = objs.at(0)?.[field] as R
    const didNotMatch = objs.reduce((prev, obj) => {
      return prev || obj[field] !== expectedValue
    }, false)
    return didNotMatch ? undefined : expectedValue
  }

  protected contractInfoRequiredFields(callResults: CryptoContractFunctionCallResult[]): Promisable<Omit<ContractInfo, 'schema'>> {
    return {
      address: assertEx(CryptoContractDiviner.matchingExistingField(callResults, 'address'), 'Mismatched address'),
      chainId: assertEx(CryptoContractDiviner.matchingExistingField(callResults, 'chainId'), 'Mismatched chainId'),
    }
  }

  protected override async divineHandler(inPayloads: CryptoContractFunctionCallResult[] = []): Promise<TContractInfo[]> {
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
        return {
          ...(await this.reduceResults(address, foundCallResults)),
          ...this.contractInfoRequiredFields(foundCallResults),
        } as TContractInfo
      }),
    )

    return result
  }

  protected abstract reduceResults(
    address: string,
    callResults: CryptoContractFunctionCallResult[],
  ): Promisable<Omit<TContractInfo, 'address' | 'chainId'>>
}
